import { TRANSFER_EXP_PROCESS_IN_SECONDS } from 'utils/settings';
import { AppLogger } from 'utils/logger';
import { ICacheService } from './interfaces';
import { EdcClient } from 'core/services/sfc-dataspace/edc-client';

const logger = new AppLogger('AuthTokenCallbackUsecase');
export class AuthTokenCallbackUsecase {
  readonly dataQueue = [];

  constructor(
    private edcClient: EdcClient,
    private cacheService: ICacheService
  ) {}

  async execute(requestInput) {
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
