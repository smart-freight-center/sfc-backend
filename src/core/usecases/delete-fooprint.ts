import { validateSchema } from 'utils/helpers';
import { ISfcDataSpace } from 'core/usecases/interfaces';

export class DeleteFootprintUsecase {
  constructor(private sfcDataSpace: ISfcDataSpace) {}

  async execute(shipmentId: string, companyId: string) {
    await validateSchema({ shipmentId }, { shipmentId: 'required|string' });
    await this.sfcDataSpace.unshareFootprint(shipmentId, companyId);
  }
}
