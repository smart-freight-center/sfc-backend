import { Participant } from 'core/types';
import { validateSchema } from 'utils/helpers';
import * as builder from '../utils/edc-builder';

import { AppLogger } from 'utils/logger';
import dateAndTime from 'date-and-time';
import { TRANSFER_EXP_PROCESS_IN_SECONDS } from 'utils/settings';
import { EdcTransferService } from 'core/services/sfc-dataspace/edc-transfer-service';
import { ICacheService, ISFCAPI } from './interfaces';
import { ContractNotFound } from 'utils/errors';
import { Offer } from '@think-it-labs/edc-connector-client';

const inputSchema = {
  year: 'required|integer',
  month: 'required|integer',
};

type Input = {
  year: number;
  month: number;
};

type ProviderContract = {
  provider: Omit<Participant, 'connection'>;
  contractOffer: Offer;
  assetId: string;
};

const logger = new AppLogger('InitiateBatchRequestUsecase');

export class InitiateBatchRequestUsecase {
  constructor(
    private edcTransferService: EdcTransferService,
    private sfcAPI: ISFCAPI,
    private cacheService: ICacheService
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
    connections: Omit<Participant, 'connection'>[],
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
