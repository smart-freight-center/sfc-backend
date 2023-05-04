import { EdcAdapter } from 'participants/clients/edc-client';
import { SFCAPIType } from 'participants/types';
import { ContractNotFound } from 'utils/error';
import { validateSchema } from 'utils/helpers';
import * as builder from '../utils/edc-builder';
import { ParticipantType } from 'entities/client-types';
import { ContractNegotiationState, ContractOffer } from 'entities';
import { ContractAgreement } from '@think-it-labs/edc-connector-client';

const inputSchema = {
  companyId: 'required|min:2',
  shipmentId: 'required|min:2',
};

type Input = {
  shipmentId: string;
};

export class InitiateFileTransferUsecase {
  constructor(private edcClient: EdcAdapter, private sfcAPI: SFCAPIType) {}

  async execute(inputData: Input, authorization: string) {
    validateSchema(inputData, inputSchema);

    const { shipmentId } = inputData;

    const catalogsAssets = await this.getCatalogsAssets(
      authorization,
      shipmentId
    );

    catalogsAssets.forEach((shipments, provider) => {
      shipments.map((shipment) =>
        this.initiateTransferProcess(provider, shipment)
      );
    });
  }

  private async initiateTransferProcess(provider, shipmentId: string) {
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

  private async startContractNegotiation(
    provider: Omit<ParticipantType, 'connection'>,
    shipmentId: string
  ) {
    const contractOffer = await this.getContractOffer(
      shipmentId,
      provider.connector_data.addresses.protocol
    );

    const result = await this.negotiateContract(contractOffer, provider);

    return result;
  }

  async getContractOffer(
    shipmentId: string,
    connectorProtocolAddress?: string
  ) {
    const assetFilter = {
      filterExpression: [builder.filter('asset:prop:id', shipmentId)],
    };

    const catalogs = await this.edcClient.listCatalog({
      providerUrl: connectorProtocolAddress
        ? `${connectorProtocolAddress}/data`
        : `${this.edcClient.edcClientContext.protocol}/data`,
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
    const agreementsFilter = {
      filterExpression: [builder.filter('assetId', shipmentId)],
    };
    const response = await this.edcClient.queryAllAgreements(agreementsFilter);
    if (!response.length) {
      return undefined;
    }
    return response[0].id;
  }

  private async getConnections(authorization: string) {
    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );

    const connections = await sfcConnection.getCompanies();
    return connections;
  }

  private async getCatalogsAssets(authorization: string, shipmentId: string) {
    const catalogsAssets = new Map<
      Omit<ParticipantType, 'connection'>,
      string[]
    >();
    const connections = await this.getConnections(authorization);

    await Promise.all(
      connections.map(async (provider) => {
        const catalog = await this.edcClient.listCatalog({
          providerUrl: `${provider.connector_data.addresses.protocol}/data`,
          querySpec: builder.filter('asset:prop:id', `${shipmentId}%`, 'LIKE'),
        });

        const offers: string[] = [];
        if (catalog.contractOffers.length) {
          const offers = catalog.contractOffers.map(
            (offer) => offer.asset?.id as string
          );
          catalogsAssets.set(provider, [...new Set(offers)]);
        }
      })
    );
    return catalogsAssets;
  }
}
