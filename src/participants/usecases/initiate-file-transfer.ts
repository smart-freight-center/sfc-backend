import { EdcAdapter } from 'participants/clients/edc-client';
import { SFCAPIType } from 'participants/types';
import { ContractNotFound } from 'utils/error';
import { sleep, validateSchema } from 'utils/helpers';
import * as builder from '../utils/edc-builder';
import { ParticipantType } from 'entities/client-types';
import { ContractNegotiationState, ContractOffer } from 'entities';
import { AppLogger } from 'utils/logger';
import { CacheServiceType } from 'clients';
import { TRANSFER_EXP_PROCESS_IN_SECONDS } from 'utils/settings';
import { error } from 'console';

const inputSchema = {
  shipmentId: 'required|min:2',
};

type Input = {
  shipmentId: string;
};

type ProviderShipmentOffer = {
  provider: Omit<ParticipantType, 'connection'>;
  assetId: string;
};

const logger = new AppLogger('InitiateFileTransferUsecase');

export class InitiateFileTransferUsecase {
  constructor(
    private edcClient: EdcAdapter,
    private sfcAPI: SFCAPIType,
    private cacheService: CacheServiceType
  ) {}

  async execute(inputData: Input, authorization: string) {
    validateSchema(inputData, inputSchema);

    logger.info('Initiating file transfer...', {
      shipmentId: inputData.shipmentId,
    });

    const { shipmentId } = inputData;

    const catalogsAssets = await this.getCatalogsAssets(
      authorization,
      shipmentId
    );

    if (!catalogsAssets.length) {
      throw new ContractNotFound();
    }
    const assetIds: string[] = [];
    for (const shipmentLeg of catalogsAssets) {
      const { provider, assetId } = shipmentLeg;

      assetIds.push(assetId);
      await this.initiateTransferProcess(provider, assetId);
    }

    await this.cacheService.storeItem(
      shipmentId,
      {
        assetIds,
      },
      TRANSFER_EXP_PROCESS_IN_SECONDS
    );

    logger.info('Successfully initited file transfer');
  }

  private async initiateTransferProcess(provider, assetId: string) {
    const contractAgreementId = await this.getContractAgreementId(assetId);
    if (contractAgreementId) {
      const response = await this.initiateTransfer(
        provider,
        assetId,
        contractAgreementId
      );
      return response;
    } else {
      const negotiationResponse = await this.startContractNegotiation(
        provider,
        assetId
      );

      await this.waitForContractNegotiationToComplete(negotiationResponse.id);

      const agreementForNegotiation =
        await this.edcClient.getAgreementForNegotiation(negotiationResponse.id);

      return await this.initiateTransfer(
        provider,
        assetId,
        agreementForNegotiation.id
      );
    }
  }

  private async waitForContractNegotiationToComplete(
    contractNegotiationId: string
  ) {
    let negotiation = await this.edcClient.getNegotiationState(
      contractNegotiationId
    );

    while (
      negotiation.state === ContractNegotiationState.INITIAL ||
      negotiation.state === ContractNegotiationState.REQUESTED
    ) {
      await sleep(1000);

      negotiation = await this.edcClient.getNegotiationState(
        contractNegotiationId
      );
    }
    if (negotiation.state !== ContractNegotiationState.CONFIRMED) {
      throw new Error(
        'An error occured while retrieving the data. Please make sure that you have the right acces to it.'
      );
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

  async getContractOffer(shipmentId: string, connectorProtocolAddress: string) {
    const assetFilter = {
      filterExpression: [builder.filter('asset:prop:id', shipmentId)],
    };

    const catalogs = await this.edcClient.listCatalog({
      providerUrl: `${connectorProtocolAddress}/data`,
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
    assetId: string,
    contractAgreementId: string
  ) {
    const transferProcessInput = builder.transferProcessInput(
      assetId,
      provider.connector_data,
      contractAgreementId
    );
    const response = await this.edcClient.initiateTransfer(
      transferProcessInput
    );
    return response;
  }

  private async getContractAgreementId(assetId: string) {
    const agreementsFilter = builder.shipmentFilter('assetId', assetId, '=');
    const agreements = await this.edcClient.queryAllAgreements(
      agreementsFilter
    );

    if (!agreements.length) return;

    return agreements[0].id;
  }

  private async getConnections(authorization: string) {
    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );

    const connections = await sfcConnection.getCompanies();
    return connections;
  }

  private async getCatalogsAssets(authorization: string, shipmentId: string) {
    logger.info('Getting all assets that match shipment...');
    const connections = await this.getConnections(authorization);
    const allShipments = await Promise.all(
      connections.map(async (provider) => {
        const catalog = await this.edcClient.listCatalog({
          providerUrl: `${provider.connector_data.addresses.protocol}/data`,
          querySpec: builder.shipmentFilter(
            'asset:prop:id',
            `${shipmentId}%`,
            'LIKE'
          ),
        });
        const assetIds = catalog.contractOffers.map(
          (offer) => offer.asset?.id as string
        );
        if (assetIds[0]) {
          return {
            provider,
            assetId: assetIds[0],
          };
        }
        return;
      })
    );

    logger.info('Successfully retrieved all related assets');

    return allShipments.filter((assetId) => assetId) as ProviderShipmentOffer[];
  }
}
