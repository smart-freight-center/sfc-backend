import { EdcAdapter } from '../clients/EdcClient';
import { CatalogRequest, ShareFootprintInput } from '../entities';
export class ConsumeFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async listCatalogs(input: CatalogRequest) {
    const assets = await this.edcClient.listCatalogs(input);
    return {
      body: assets,
    };
  }
}
