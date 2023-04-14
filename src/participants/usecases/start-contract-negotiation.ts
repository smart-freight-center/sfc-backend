import { EdcAdapter } from '../clients';
import {
  ContractNegotiationInput,
  ContractOffer,
  ParticipantType,
} from 'entities';
import * as builder from '../utils/edc-builder';
import { SFCAPIType } from 'participants/types';
import { validateSchema } from 'utils/helpers';
import { ContractNotFound } from 'utils/error';

const inputSchema = {
  clientId: 'min:1|required',
  shipmentId: 'min:1|required',
};

export class StartContractNegotiationUsecase {
  constructor(private edcClient: EdcAdapter, private sfcAPI: SFCAPIType) {}

  async execute(authorization: string, input: ContractNegotiationInput) {
    validateSchema(input, inputSchema);
    const { clientId, shipmentId } = input;

    const provider = await this.getProvider(authorization, clientId);

    const contractOffer = await this.getContractOffer(shipmentId, provider);

    const contractNegotiationCreationResult = await this.negotiateContract(
      contractOffer,
      provider
    );

    return contractNegotiationCreationResult;
  }

  private async getProvider(authorization: string, clientId: string) {
    const apiConnection = await this.sfcAPI.createConnection(authorization);

    const provider = await apiConnection.getCompany(clientId);
    return provider;
  }

  private async getContractOffer(
    shipmentId: string,
    provider: Omit<ParticipantType, 'connection'>
  ) {
    const assetFilter = builder.catalogAssetFilter(shipmentId);

    const catalogs = await this.edcClient.listCatalog({
      providerUrl: provider.connector_data.addresses.protocol + '/data',
      querySpec: assetFilter,
    });

    if (!catalogs?.contractOffers[0]) {
      throw new ContractNotFound();
    }

    const contractOffer = catalogs?.contractOffers[0];
    return contractOffer;
  }

  private async negotiateContract(
    contractOffer: ContractOffer,
    provider: Omit<ParticipantType, 'connection'>
  ) {
    const contractNegotitionInput = builder.contractNegotiationInput(
      contractOffer,
      provider.connector_data.addresses.protocol + '/data'
    );
    const contractNegotiationCreationResult =
      await this.edcClient.starContracttNegotiation(contractNegotitionInput);
    return contractNegotiationCreationResult;
  }
}
