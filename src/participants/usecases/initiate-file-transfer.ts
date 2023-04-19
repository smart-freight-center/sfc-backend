import { EdcAdapter } from 'participants/clients/edc-client';
import { SFCAPIType } from 'participants/types';
import { ContractNotFound } from 'utils/error';
import { validateSchema } from 'utils/helpers';
import * as builder from '../utils/edc-builder';
import { ParticipantType } from 'entities/client-types';
import { Addresses, ContractNegotiationState, ContractOffer } from 'entities';
import { ContractAgreement } from '@think-it-labs/edc-connector-client';

const inputSchema = {
  clientId: 'required|min:2',
  shipmentId: 'required|min:2',
};

type Input = {
  clientId: string;
  shipmentId: string;
};

export class InitiateFileTransferUsecase {
  constructor(private edcClient: EdcAdapter, private sfcAPI: SFCAPIType) {}

  async execute(inputData: Input, authorization: string) {
    validateSchema(inputData, inputSchema);

    const { clientId, shipmentId } = inputData;

    const provider = await this.getProvider(authorization, clientId);

    await this.registerDataplane(
      provider.client_id,
      provider.connector_data.addresses
    );

    await this.registerDataplane(
      this.edcClient.edcClientId,
      this.edcClient.edcClientContext
    );

    const contractAgreementId = await this.getContractAgreementId(shipmentId);
    if (contractAgreementId) {
      const response = await this.initiateTransfer(
        provider,
        shipmentId,
        contractAgreementId
      );
      return response;
    } else {
      const negotiationResponse = await this.startContractNegotiation(
        provider,
        shipmentId
      );

      return new Promise<ContractAgreement>((resolve, reject) => {
        const poll = () => {
          setTimeout(async () => {
            try {
              const state = await this.edcClient.getNegotiationState(
                negotiationResponse.id
              );
              if (state.state === ContractNegotiationState.CONFIRMED) {
                const contractAgreement =
                  await this.edcClient.getAgreementForNegotiation(
                    negotiationResponse.id
                  );
                resolve(contractAgreement);
              } else if (
                state.state === ContractNegotiationState.INITIAL ||
                ContractNegotiationState.REQUESTED
              ) {
                poll();
              } else {
                reject(
                  new Error(
                    'An error occured while retrieving the data. Please make sure that you have the right acces to it.'
                  )
                );
              }
            } catch (error) {
              reject(error);
            }
          }, 1000);
        };
        poll();
      }).then(async (contractAgreement) => {
        return await this.initiateTransfer(
          provider,
          shipmentId,
          contractAgreement.id
        );
      });
    }
  }

  private async startContractNegotiation(provider, shipmentId) {
    const contractOffer = await this.getContractOffer(shipmentId, provider);

    const result = await this.negotiateContract(contractOffer, provider);

    return result;
  }

  private async getContractOffer(
    shipmentId: string,
    provider: Omit<ParticipantType, 'connection'>
  ) {
    const assetFilter = builder.filter('asset:prop:id', shipmentId);

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
      provider.connector_data
    );
    const contractNegotiationCreationResult =
      await this.edcClient.starContracttNegotiation(contractNegotitionInput);
    return contractNegotiationCreationResult;
  }

  private async getProvider(authorization: string, clientId: string) {
    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );

    const provider = await sfcConnection.getCompany(clientId);
    return provider;
  }

  private async initiateTransfer(
    provider: Omit<ParticipantType, 'connection'>,
    shipmentId: string,
    contractAgreementId: string
  ) {
    const transferProcessInput = builder.transferProcessInput(
      shipmentId,
      provider.connector_data,
      contractAgreementId
    );
    const response = await this.edcClient.initiateTransfer(
      transferProcessInput
    );
    return response;
  }

  private async getContractAgreementId(shipmentId: string) {
    const agreementsFilter = builder.filter('assetId', shipmentId);
    const response = await this.edcClient.queryAllAgreements(agreementsFilter);
    if (!response.length) {
      return undefined;
    }
    return response[0].id;
  }

  async registerDataplane(clientId: string, connectorAddresses: Addresses) {
    const dataPlaneInput = builder.dataplaneInput(clientId, connectorAddresses);
    await this.edcClient.registerDataplane(dataPlaneInput);
  }
}
