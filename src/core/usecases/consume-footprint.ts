import { EdcAdapter } from '../clients/EdcClient';
import { CatalogRequest, ContractOffer } from '../entities';
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

  async startContractNegotiation(
    contractOffer: ContractOffer,
    connectorIdsAddress: string
  ) {
    const contractNegotitionInput = builder.contractNegotiationInput(
      contractOffer,
      connectorIdsAddress
    );
    const contractNegotiationCreationResult =
      await this.edcClient.starContracttNegotiation(contractNegotitionInput);
    return {
      body: contractNegotiationCreationResult,
    };
  }
}
