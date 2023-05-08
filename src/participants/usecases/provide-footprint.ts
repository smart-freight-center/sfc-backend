import { EdcAdapter } from '../clients/edc-client';

export class ProvideFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async list() {
    const assetWithContracts = await this.getAssetsWithContracts();
    const uniqueAssetWithContract = new Set(assetWithContracts);
    const assets = await this.edcClient.listAssets();

    return assets
      .filter((asset) => uniqueAssetWithContract.has(asset.id))
      .map((asset) => ({
        createdAt: asset.createdAt,
        id: asset.id,
        name: asset.properties['asset:prop:name'],
        sharedWith: asset.properties['asset:prop:sharedWith'],
      }));
  }

  private async getAssetsWithContracts() {
    const catalogs = await this.edcClient.listCatalog({
      providerUrl: `${this.edcClient.edcClientContext.protocol}/data`,
    });

    return catalogs?.contractOffers
      .filter((offer) => offer.asset?.id)
      .map((offer) => offer.asset?.id) as string[];
  }

  async delete(contractId: string) {
    await this.edcClient.deleteContractDefinition(contractId);
  }
}
