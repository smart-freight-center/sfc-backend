import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import axios from 'axios';
import { ShareFootprintInput } from 'entities';
import { AWS_ACCESS_ID, AWS_REGION, AWS_SECRET } from 'utils/settings';

export class DataSourceService {
  public static async fetchFootprintData(input: ShareFootprintInput) {
    const dataType = input.type;
    if (dataType === 'http') {
      const url = input.dataLocation.baseUrl as string;
      const path = input.dataLocation.path || '';
      const response = await axios.get(url + path);
      return response.data;
    } else if (dataType === 's3') {
      return this.fetchDataOnS3(input);
    } else {
      throw new Error('Not supported');
    }
  }
  private static async fetchDataOnS3(input: ShareFootprintInput) {
    const command = new GetObjectCommand({
      Key: input.dataLocation.path,
      Bucket: input.dataLocation.bucketName,
    });

    const s3Client = new S3Client({
      region: AWS_REGION,
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

export type DataSourceServiceType = typeof DataSourceService;
