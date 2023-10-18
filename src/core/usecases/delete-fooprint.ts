import { validateData } from 'utils/helpers';
import { ISFCAPI, ISfcDataSpace } from 'core/usecases/interfaces';
import { unshareSchema } from 'core/validators';

export type DeleteFootprintInput = {
  year: string;
  month: string;
  companyId: string;
};
export class DeleteFootprintUsecase {
  constructor(private sfcAPI: ISFCAPI, private sfcDataSpace: ISfcDataSpace) {}

  async execute(authorization: string, input: DeleteFootprintInput) {
    const validatedData = await validateData(unshareSchema, input);
    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );
    const provider = await sfcConnection.getMyProfile();

    await this.sfcDataSpace.unshareFootprint(provider.client_id, validatedData);
  }
}
