import { ShareFootprintInput } from 'entities';

import { validateData } from 'utils/helpers';
import { shareFootprintInputSchema } from 'core/validators/';

import {
  DataModelValidationFailed,
  InvalidShipmentIdFormat,
} from 'utils/errors';
import { convertRawDataToJSON } from 'core/utils/data-converter';
import { EmissionDataModel } from 'core/types';
import {
  IDataSourceFetcher,
  ISFCAPI,
  ISfcDataSpace,
} from 'core/usecases/interfaces';

export class ShareFootprintUsecase {
  constructor(
    private sfcDataSpace: ISfcDataSpace,
    private dataSourceService: IDataSourceFetcher,
    private sfcAPI: ISFCAPI
  ) {}

  public async execute(
    authorization: string,
    input: Partial<ShareFootprintInput>
  ) {
    const validatedInput = this.validateInput(input);
    const rawData = await this.dataSourceService.fetchFootprintData(
      validatedInput
    );

    await this.verifyDataModel(validatedInput.shipmentId, rawData);
    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );
    const consumer = await sfcConnection.getCompany(validatedInput.companyId);
    const provider = await sfcConnection.getMyProfile();

    return this.sfcDataSpace.shareAsset(provider, consumer, validatedInput);
  }

  private validateInput(input: Partial<ShareFootprintInput>) {
    // this regex is used to validate that shipmentId contains any character except `-`, `:` or `_`
    const regex = /[_:-]/g;

    if (regex.test(input.shipmentId as string)) {
      throw new InvalidShipmentIdFormat();
    }

    input = validateData(shareFootprintInputSchema.shared, input);

    if (input.type === 'azure') {
      validateData(shareFootprintInputSchema.azure, input);
    }
    if (input.type === 's3') {
      validateData(shareFootprintInputSchema.s3, input);
    }
    if (input.type === 'http') {
      validateData(shareFootprintInputSchema.http, input);
    }

    return input as ShareFootprintInput;
  }

  private async verifyDataModel(shipmentId: string, rawData: string | object) {
    const jsonData = convertRawDataToJSON(rawData);

    const { error, value } = shareFootprintInputSchema
      .dataModel()
      .validate(jsonData, {
        abortEarly: false,
      });

    if (!error?.details) return value as EmissionDataModel[];

    throw new DataModelValidationFailed(error);
  }
}
