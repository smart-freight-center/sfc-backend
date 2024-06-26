import { ShareFootprintInput } from 'entities';

import { validateData } from 'utils/helpers';
import { shareFootprintInputSchema } from 'core/validators/';

import { verifyDataModel } from 'utils/data-model-verifier';
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

    const { month, year } = validatedInput;
    const data = await verifyDataModel({ month, year }, rawData);
    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );
    const consumer = await sfcConnection.getCompany(validatedInput.companyId);
    const provider = await sfcConnection.getMyProfile();

    const numberOfRows = data.length;
    return this.sfcDataSpace.shareAsset({
      ...validatedInput,
      provider,
      consumer,
      numberOfRows,
    });
  }

  private validateInput(input: Partial<ShareFootprintInput>) {
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
}
