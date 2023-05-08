import { EdcAdapter } from 'participants/clients';
import { TransferProcessResponse } from 'entities';
import { CacheServiceType } from 'clients';
import { TRANSFER_EXP_PROCESS_IN_SECONDS } from 'utils/settings';
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
    const contextKeys = await this.getTransferKeys(shipmentId);
    const response = await this.edcClient.getTranferedData(contextKeys);
    if (response.body) {
      const textData = await response.text();
      return convertRawDataToJSON(textData);
    }
  }

  private async getTransferKeys(shipmentId: string) {
    const contextKeys = await this.cacheService.retrieve(shipmentId);

    if (!contextKeys) throw new TransferNotInitiated(shipmentId);
    return contextKeys as TransferProcessResponse;
  }

  async getTransferProcessResponse(requestInput) {
    logger.info('Caching auth code and keys...');
    const transferProcessResponse = {
      ...requestInput,
      endpoint: this.edcClient.edcClientContext.public,
    };

    const agreement = await this.edcClient.getContractAgreement(
      transferProcessResponse.properties.cid
    );

    await this.cacheService.storeItem(
      agreement.assetId,
      transferProcessResponse,
      TRANSFER_EXP_PROCESS_IN_SECONDS
    );

    logger.info('Successfully stored auth code in redis');
  }
}
