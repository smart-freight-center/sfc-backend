import { EdcAdapter } from 'participants/clients';
import { TransferProcessResponse } from 'entities';
import { CacheServiceType } from 'clients';
import { TransferNotInitiated } from 'utils/error';
import { AppLogger } from 'utils/logger';
import { convertRawDataToJSON } from 'participants/utils/data-converter';
import { EmissionDataModel } from 'participants/types';

const logger = new AppLogger('GetEmissionsUsecase');
export class GetEmissionsUsecase {
  readonly dataQueue = [];

  constructor(
    private edcClient: EdcAdapter,
    private cacheService: CacheServiceType
  ) {}

  async execute(jobId: string, aggregate: boolean) {
    logger.info('Pulling data for all assets...');
    const { assetIds } = await this.getKeyFromCache(jobId);

    const dataIsForShipmentId = !jobId.startsWith('batch_key:');

    const allAssetData = await Promise.all(
      assetIds.map((assetId) => this.fetchData(assetId))
    );
    const emissions: EmissionDataModel[] = [];

    for (const dataLeg of allAssetData) {
      emissions.push(...dataLeg);
    }

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

  private aggregateEmissions(emissions: EmissionDataModel[]) {
    const aggregated = {
      transport_activity: 0,
      mass: 0,
      actual_distance: 0,
      co2_wtw: 0,
    };
    for (const emission of emissions) {
      aggregated.transport_activity += +emission.transport_activity || 0;
      aggregated.mass += +emission.mass || 0;
      aggregated.actual_distance += +emission.actual_distance || 0;
      aggregated.co2_wtw += +emission.co2_wtw || 0;
    }
    return aggregated;
  }

  private async getKeyFromCache(key: string) {
    const data = await this.cacheService.retrieve(key);

    if (!data) throw new TransferNotInitiated(key);
    return data;
  }

  private async fetchData(assetId: string) {
    const transferInput: TransferProcessResponse = await this.getKeyFromCache(
      assetId
    );

    const response = await this.edcClient.getTranferedData(transferInput);

    if (response.body) {
      const textData = await response.text();
      return convertRawDataToJSON(textData);
    }
  }
}
