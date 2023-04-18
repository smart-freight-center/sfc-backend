import { EdcAdapter } from '../clients';
import {
  CatalogRequest,
  Connector,
  ContractOffer,
  ListCatalogInput,
} from 'entities';
import * as builder from '../utils/edc-builder';
import { SFCAPIType } from 'participants/types';
import { validateSchema } from 'utils/helpers';

const listCatalogSchema = {
  clientId: 'min:1|required',
};
export class ConsumeFootprintUsecase {
  constructor(private edcClient: EdcAdapter, private sfcAPI: SFCAPIType) {}

  async listCatalogs(authorization: string, input: ListCatalogInput) {
    validateSchema(input, listCatalogSchema);
    const sfcAPISession = await this.sfcAPI.createConnection(authorization);
    const provider = await sfcAPISession.getCompany(input.clientId);

    const querySpec = this.getQuerySpec(input.shipmentId);
    const catalogs = await this.edcClient.listCatalog({
      providerUrl: provider.connector_data.addresses.protocol + '/data',
      querySpec: querySpec,
    });
    return catalogs;
  }

  getQuerySpec(shipmentId?: string) {
    if (shipmentId) {
      return builder.catalogAssetFilter(shipmentId);
    }
    return undefined;
  }

  async listFilteredCatalog(input: CatalogRequest, shipmentId: string) {
    const assetFilter = builder.catalogAssetFilter(shipmentId);
    return await this.edcClient.listCatalog({
      ...input,
      querySpec: assetFilter,
    });
  }

  async startContractNegotiation(
    contractOffer: ContractOffer,
    connector: Connector
  ) {
    const contractNegotitionInput = builder.contractNegotiationInput(
      contractOffer,
      connector
    );
    return this.edcClient.starContracttNegotiation(contractNegotitionInput);
  }

  async getContractNegotiationResponse(input: string) {
    const response = await this.edcClient.getContractNegotiationResponse(input);
    return response;
  }
}
