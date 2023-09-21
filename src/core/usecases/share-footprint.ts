import { ShareFootprintInput } from 'entities';

import { validateSchema } from 'utils/helpers';
import {
  customMessage,
  shareFootprintSchema,
} from 'core/validators/share-footprint-schema';

import {
  DataModelValidationFailed,
  InvalidShipmentIdFormat,
} from 'utils/errors';
import { convertRawDataToJSON } from 'core/utils/data-converter';
import { EmissionDataModel, SFCAPIType } from 'core/types';
import { IDataSourceFetcher, ISfcDataSpace } from 'core/usecases/interfaces';

export class ShareFootprintUsecase {
  constructor(
    private sfcDataSpace: ISfcDataSpace,
    private dataSourceService: IDataSourceFetcher,
    private sfcAPI: SFCAPIType
  ) {}

  public async execute(authorization: string, input: ShareFootprintInput) {
    this.validateInputSchema(input);
    const rawData = await this.dataSourceService.fetchFootprintData(input);

    await this.verifyDataModel(input.shipmentId, rawData);
    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );
    const consumer = await sfcConnection.getCompany(input.companyId);
    const provider = await sfcConnection.getMyProfile();

    return this.sfcDataSpace.shareFootPrint(provider, consumer, input);
  }

  private validateInputSchema(input: Partial<ShareFootprintInput>) {
    // this regex is used to validate that shipmentId contains any character except `-`, `:` or `_`
    const regex = /[_:-]/g;

    if (regex.test(input.shipmentId as string)) {
      throw new InvalidShipmentIdFormat();
    }
    input.type = input.type?.toLowerCase() as ShareFootprintInput['type'];
    validateSchema(input, shareFootprintSchema.shared, customMessage.shared);
    if (input.type === 'azure') {
      validateSchema(input, shareFootprintSchema.azure);
    }
    if (input.type === 's3') {
      validateSchema(input, shareFootprintSchema.s3);
    }
    if (input.type === 'http') {
      validateSchema(input, shareFootprintSchema.http);
    }
  }

  private async verifyDataModel(shipmentId: string, rawData: string | object) {
    const jsonData = convertRawDataToJSON(rawData);

    const { error, value } = shareFootprintSchema
      .dataModel(shipmentId)
      .validate(jsonData, {
        abortEarly: false,
      });

    if (!error?.details) return value as EmissionDataModel[];

    throw new DataModelValidationFailed(error);
  }
}
