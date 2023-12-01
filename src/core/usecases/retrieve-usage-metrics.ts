import { ISFCAPI, ISfcDataSpace } from './interfaces';
import { AppLogger } from 'utils/logger';
import { Participant } from 'core/types';
const logger = new AppLogger('ShareFootprintUsecase');

type ProviderMetrics = {
  totalNumberOfRowsShared: number;
  totalFootprintsShared: number;
  totalCompaniesYouHaveSharedFootprintsWith: number;
};

type ConsumeMetrics = {
  totalNumberOfRowsReceived: number;
  totalFootprintsReceived: number;
  totalCompaniesYouHaveReceivedFootprintsFrom: number;
};

export class RetrieveUsageMetricsUsecase {
  constructor(private sfcDataspace: ISfcDataSpace, private sfcUnit: ISFCAPI) {}

  async execute(authorization: string) {
    logger.info('Retrieving metrics...');

    const sfcUnitConn = await this.sfcUnit.createConnection(authorization);
    const participant = await sfcUnitConn.getMyProfile();

    const companies = await sfcUnitConn.getCompanies();

    const [providerMetrics, comsumerMetrics] = await Promise.all([
      this.calculateProviderMetrics(participant),
      this.calculateConsumerMetrics(participant, companies),
    ]);

    return {
      ...providerMetrics,
      ...comsumerMetrics,
    };
  }

  private async calculateProviderMetrics(participant: Participant) {
    const items = await this.sfcDataspace.fetchSharedFootprintsMetaData(
      participant.client_id
    );

    const providerMetrics: ProviderMetrics = {
      totalNumberOfRowsShared: 0,
      totalFootprintsShared: items.length,
      totalCompaniesYouHaveSharedFootprintsWith: 0,
    };

    const uniqueCompanies = new Set<string>();
    for (const sharedFootprint of items) {
      providerMetrics.totalNumberOfRowsShared += +sharedFootprint.numberOfRows;
      uniqueCompanies.add(sharedFootprint.owner);
    }
    providerMetrics.totalCompaniesYouHaveSharedFootprintsWith =
      uniqueCompanies.size;

    return providerMetrics;
  }

  private async calculateConsumerMetrics(
    participant: Participant,
    companies: Omit<Participant, 'connection'>[]
  ) {
    const catalogAssets = await this.sfcDataspace.fetchReceivedAssets(
      companies,
      participant.client_id
    );

    const metrics: ConsumeMetrics = {
      totalNumberOfRowsReceived: 0,
      totalFootprintsReceived: catalogAssets.length,
      totalCompaniesYouHaveReceivedFootprintsFrom: 0,
    };

    const uniqueOwners = new Set<string>();

    for (const singleAsset of catalogAssets) {
      metrics.totalNumberOfRowsReceived +=
        +singleAsset.footprintData.numberOfRows;
      uniqueOwners.add(singleAsset.footprintData.owner);
    }

    metrics.totalCompaniesYouHaveReceivedFootprintsFrom = uniqueOwners.size;

    return metrics;
  }
}
