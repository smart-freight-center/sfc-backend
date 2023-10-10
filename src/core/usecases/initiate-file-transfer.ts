import { Participant } from 'core/types';
import { validateSchema } from 'utils/helpers';
import * as builder from 'utils/edc-builder';
import { AppLogger } from 'utils/logger';
import { TRANSFER_EXP_PROCESS_IN_SECONDS } from 'utils/settings';
import { EdcTransferService } from 'core/services/sfc-dataspace/edc-transfer-service';
import { ICacheService, ISFCAPI, ISfcDataSpace } from './interfaces';
import { ContractNotFound } from 'utils/errors';
import { Offer } from '@think-it-labs/edc-connector-client';

const inputSchema = {
  shipmentId: 'required|min:2',
};

type Input = {
  shipmentId: string;
};

type ProviderContract = {
  provider: Omit<Participant, 'connection'>;
  contractOffer: Offer;
  assetId: string;
};

const logger = new AppLogger('InitiateFileTransferUsecase');

export class InitiateFileTransferUsecase {
  constructor(
    private edcTransferService: EdcTransferService,
    private sfcAPI: ISFCAPI,
    private cacheService: ICacheService,
    private sfcDataSpace: ISfcDataSpace
  ) {}

  async execute(inputData: Input, authorization: string) {
    validateSchema(inputData, inputSchema);

    logger.info('Initiating file transfer...');

    const { shipmentId } = inputData;
    const connections = await this.getConnections(authorization);
    const { providerContracts, query: jobId } = await this.fetchByShipmentId(
      connections,
      shipmentId
    );

    const assetIds = await this.startTransferOnAllAssets(providerContracts);

    await this.cacheService.storeItem(
      jobId,
      {
        assetIds,
      },
      TRANSFER_EXP_PROCESS_IN_SECONDS
    );

    logger.info('Successfully initited file transfer');

    return jobId;
  }

  private async getConnections(authorization: string) {
    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );

    const connections = await sfcConnection.getCompanies();
    return connections;
  }

  private async fetchByShipmentId(
    connections: Omit<Participant, 'connection'>[],
    shipmentId: string
  ) {
    logger.info('Getting all assets that match shipment...');

    const providerContracts: ProviderContract[] = [];

    const edcClient = this.edcTransferService.getEdcClient();
    await Promise.all(
      connections.map(async (provider) => {
        const catalog = await edcClient.listCatalog({
          providerUrl: `${provider.connector_data.addresses.protocol}/data`,
          querySpec: builder.shipmentFilter(
            'asset:prop:id',
            `${shipmentId}%`,
            'LIKE'
          ),
        });

        catalog.datasets
          .filter((dataset) => {
            return dataset.asset?.id.startsWith(shipmentId);
          })

          .forEach((dataset) => {
            dataset.offers.forEach((offer) => {
              if (offer.asset?.id) {
                providerContracts.push({
                  provider,
                  assetId: offer.asset?.id as string,
                  contractOffer: offer,
                });
              }
            });
          });
      })
    );

    if (!providerContracts.length) throw new ContractNotFound();

    logger.info('Successfully retrieved all related assets', {
      providerContracts,
    });

    return {
      query: shipmentId,
      providerContracts,
    };
  }

  private async startTransferOnAllAssets(shipmentLegs: ProviderContract[]) {
    const assetIds: string[] = [];
    for (const shipmentLeg of shipmentLegs) {
      const { provider, assetId, contractOffer } = shipmentLeg;

      assetIds.push(assetId);
      await this.sfcDataSpace.startTransferProcess(provider, contractOffer);
    }
    return assetIds;
  }
}
