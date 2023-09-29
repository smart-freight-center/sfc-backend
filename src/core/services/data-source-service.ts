import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import { ShareFootprintInput } from 'entities';
import { IDataSourceFetcher } from 'core/usecases/interfaces';
import { AWS_ACCESS_ID, AWS_SECRET, CLIENT_CONFIG } from 'utils/settings';
import { CouldntFetchDataInSource } from 'utils/errors';

export class DataSourceService implements IDataSourceFetcher {
  public async fetchFootprintData(input: ShareFootprintInput) {
    const dataType = input.type;
    if (dataType === 'http') {
      return await this.fetchDataFromURL(input);
    } else if (dataType === 's3') {
      return this.fetchDataOnS3(input);
    } else {
      throw new Error('Not supported');
    }
  }
  private async fetchDataFromURL(input: ShareFootprintInput) {
    const { baseUrl, path = '', authCode, authKey } = input.dataLocation;
    const url = baseUrl as string;
    const fullURL = url + path;
    let headers: object = {};
    if (authCode && authKey) {
      headers = {
        [authKey]: authCode,
      };
    }

    try {
      const response = await axios.get(fullURL, { headers });

      return response.data;
    } catch (error) {
      throw new CouldntFetchDataInSource();
    }
  }

  private async fetchDataOnS3(input: ShareFootprintInput) {
    const command = new GetObjectCommand({
      Key: input.dataLocation.keyName,
      Bucket: input.dataLocation.bucketName,
    });

    const s3Client = new S3Client({
      region: CLIENT_CONFIG.region,
      credentials: {
        accessKeyId: AWS_ACCESS_ID || '',
        secretAccessKey: AWS_SECRET || '',
      },
    });

    const response = await s3Client.send(command);
    const body = await response.Body?.transformToString();

    return body;
  }
}
