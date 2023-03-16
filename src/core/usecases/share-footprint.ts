import { EdcAdapter } from '../../core/clients/EdcClient';
import { ShareFootprintInput } from 'core/entities/data-address';

export class ShareFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async execute(data: ShareFootprintInput) {
    // this.edcClient.listAssets();
    // other logic
    // return

    // const assets = await this.edcClient.listAssets();

    return {
      status: 'here we go',
    };
  }
}
