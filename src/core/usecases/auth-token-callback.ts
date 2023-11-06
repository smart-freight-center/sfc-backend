import { TRANSFER_EXP_PROCESS_IN_SECONDS } from 'utils/settings';
import { AppLogger } from 'utils/logger';
import { ICacheService } from './interfaces';
import { EdcClient } from 'core/services/sfc-dataspace/edc-client';

const logger = new AppLogger('AuthTokenCallbackUsecase');

export type TransferCallbackInput = {
  id: string;
  endpoint: string;
  authKey: 'Authorization';
  authCode: string;
};
export class AuthTokenCallbackUsecase {
  readonly dataQueue = [];

  constructor(
    private edcClient: EdcClient,
    private cacheService: ICacheService
  ) {}

  async execute(input: TransferCallbackInput) {
    logger.info('Caching auth code and keys...');

    const cacheValue = {
      authCode: input.authCode,
      authKey: input.authKey,
    };
    const transferProcess = await this.edcClient.getTransferProcessById(
      input.id
    );
    if (!transferProcess) return;

    const assetId: string = transferProcess.mandatoryValue('edc', 'assetId');

    await this.cacheService.storeItem(
      assetId,
      cacheValue,
      TRANSFER_EXP_PROCESS_IN_SECONDS
    );

    logger.info('Successfully stored auth code in redis');
  }
}
