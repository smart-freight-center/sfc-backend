import { EdcAdapter } from '../clients/EdcClient';
import { CatalogRequest } from '../entities';
import * as builder from '../../utils/edc-builder';

export class ConsumeFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async listCatalogs(input: CatalogRequest) {
    const assets = await this.edcClient.listCatalog(input);
    return {
      body: assets,
    };
  }

  async listFilteredCatalog(input: CatalogRequest, shipmentId: string) {
    const assetFilter = builder.catalogAssetFilter(shipmentId);
    const assets = await this.edcClient.listCatalog({
      ...input,
      querySpec: assetFilter,
    });
    return {
      body: assets,
    };
  }
}
