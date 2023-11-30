import { AppLogger } from 'utils/logger';
import { EmissionDataModel } from 'core/types';
import { ICacheService, ISfcDataSpace } from 'core/usecases/interfaces';
import { TransferNotInitiated } from 'utils/errors';

const logger = new AppLogger('GetEmissionsUsecase');

type JobCacheValue = {
  assetIds: string[];
};
export class GetEmissionsUsecase {
  readonly dataQueue = [];

  constructor(
    private sfcDataSpace: ISfcDataSpace,
    private cacheService: ICacheService
  ) {}

  async execute(jobId: string, aggregate: boolean) {
    logger.info('Pulling data for all assets...');
    const jobCacheValue = await this.getKeyFromCache(jobId);
    const { assetIds } = jobCacheValue as JobCacheValue;
    const dataIsForShipmentId = !jobId.startsWith('batch_key:');

    const emissions = await this.getEmissions(assetIds);

    if (!aggregate || !dataIsForShipmentId) {
      return { data: emissions };
    }

    const aggregatedData = this.aggregateEmissions(emissions);

    logger.info('Successfully pulled data for this shipment.');

    return {
      data: emissions,
      aggregated: aggregatedData,
    };
  }

  private async getEmissions(assetIds: string[]) {
    const allAssetData = await Promise.all(
      assetIds.map((assetId) => this.fetchData(assetId))
    );
    const emissions: EmissionDataModel[] = [];

    for (const dataLeg of allAssetData) {
      emissions.push(...dataLeg);
    }

    return emissions;
  }

  private aggregateEmissions(emissions: EmissionDataModel[]) {
    const aggregated = {
      transport_activity: 0,
      mass: 0,
      distance_actual: 0,
      co2e_wtw: 0,
    };
    for (const emission of emissions) {
      aggregated.transport_activity += +emission.transport_activity || 0;
      aggregated.mass += +emission.mass || 0;
      aggregated.distance_actual += +emission.distance_actual || 0;
      aggregated.co2e_wtw += +emission.co2e_wtw || 0;
    }
    return aggregated;
  }

  private async fetchData(assetId: string) {
    logger.info('Fetching emissions for asset...', { assetId });

    const data = await this.getKeyFromCache(assetId);

    return data as EmissionDataModel[];
  }

  private async getKeyFromCache(key: string) {
    const data = await this.cacheService.retrieve(key);

    if (!data) throw new TransferNotInitiated(key);

    return data;
  }
}
