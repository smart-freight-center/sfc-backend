import { SFCAPIType } from 'participants/types';
import { ContractNotFound } from 'utils/error';
import { validateSchema } from 'utils/helpers';
import * as builder from '../utils/edc-builder';
import { ParticipantType } from 'entities/client-types';

import { AppLogger } from 'utils/logger';
import { CacheServiceType } from 'clients';
import dateAndTime from 'date-and-time';
import { TRANSFER_EXP_PROCESS_IN_SECONDS } from 'utils/settings';
import { EdcTransferService } from 'participants/clients/edc-transfer-service';
import { ContractOffer } from 'entities';

const inputSchema = {
  year: 'required|integer',
  month: 'required|integer',
};

type Input = {
  year: number;
  month: number;
};

type ProviderContract = {
  provider: Omit<ParticipantType, 'connection'>;
  contractOffer: ContractOffer;
  assetId: string;
};

const logger = new AppLogger('InitiateBatchRequestUsecase');

export class InitiateBatchRequestUsecase {
  constructor(
    private edcTransferService: EdcTransferService,
    private sfcAPI: SFCAPIType,
    private cacheService: CacheServiceType
  ) {}

  async execute(inputData: Input, authorization: string) {
    validateSchema(inputData, inputSchema);

    logger.info('Initiating batch transfer...');

    const { year, month } = inputData;
    const connections = await this.getConnections(authorization);
    const { providerContracts, query: jobId } =
      await this.fetchAssetsByDateCreated(connections, year, month);

    const assetIds = await this.startTransferOnAllAssets(providerContracts);

    await this.cacheService.storeItem(
      jobId,
      {
        assetIds,
      },
      TRANSFER_EXP_PROCESS_IN_SECONDS
    );

    logger.info('Successfully initited batch transfer transfer');

    return jobId;
  }

  private async getConnections(authorization: string) {
    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );

    const connections = await sfcConnection.getCompanies();
    return connections;
  }

  private async fetchAssetsByDateCreated(
    connections: Omit<ParticipantType, 'connection'>[],
    year: number,
    month: number
  ) {
    logger.info('Getting all assets that by created date..');

    const providerContracts: ProviderContract[] = [];

    const date = new Date();
    date.setFullYear(year);
    date.setMonth(month - 1);
    const queryKey = dateAndTime.format(date, 'YYYY-MM');

    await Promise.all(
      connections.map(async (provider) => {
        const catalog = await this.edcTransferService
          .getEdcClient()
          .listCatalog({
            providerUrl: `${provider.connector_data.addresses.protocol}/data`,
            querySpec: builder.shipmentFilter(
              'asset:prop:id',
              `%${queryKey}-%`,
              'LIKE'
            ),
          });

        const regExp = new RegExp(`${queryKey}-\\d\\d$`);

        catalog.contractOffers
          .filter((offer) => regExp.test(offer.asset?.id || ''))
          .forEach((contractOffer) => {
            if (contractOffer.asset?.id) {
              providerContracts.push({
                provider,
                contractOffer,
                assetId: contractOffer.asset?.id,
              });
            }
          });
      })
    );

    if (!providerContracts.length) throw new ContractNotFound();

    logger.info('Successfully retrieved all related assets');

    return {
      query: `batch_key:${queryKey}`,
      providerContracts,
    };
  }

  private async startTransferOnAllAssets(shipmentLegs: ProviderContract[]) {
    const assetIds: string[] = [];
    for (const shipmentLeg of shipmentLegs) {
      const { provider, contractOffer, assetId } = shipmentLeg;

      assetIds.push(assetId);
      await this.edcTransferService.initiateTransferProcess(
        provider,
        contractOffer
      );
    }
    return assetIds;
  }
}
