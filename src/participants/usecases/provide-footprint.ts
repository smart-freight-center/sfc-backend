import { EdcAdapter } from '../clients/edc-client';

export class ProvideFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async list() {
    const assets = await this.edcClient.listAssets();

    return assets.map((asset) => ({
      createdAt: asset.createdAt,
      id: asset.id,
      name: asset.properties['asset:prop:name'],
    }));
  }
}
