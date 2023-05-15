import { EdcAdapter } from 'participants/clients';
import { TransferProcessResponse } from 'entities';
import { CacheServiceType } from 'clients';
import { TransferNotInitiated } from 'utils/error';
import { AppLogger } from 'utils/logger';
import { convertRawDataToJSON } from 'participants/utils/data-converter';

const logger = new AppLogger('GetFileUsecase');
export class GetFileUsecase {
  readonly dataQueue = [];

  constructor(
    private edcClient: EdcAdapter,
    private cacheService: CacheServiceType
  ) {}

  async pullData(shipmentId: string) {
    logger.info('Pulling data for all assets...');
    const { assetIds } = await this.getKeyFromCache(shipmentId);

    const allAssetData = await Promise.all(
      assetIds.map((assetId) => this.fetchData(assetId))
    );
    const combined: object[] = [];

    for (const dataLeg of allAssetData) {
      combined.push(...dataLeg);
    }

    logger.info('Successfully pulled data for this shipment.');

    return combined;
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
