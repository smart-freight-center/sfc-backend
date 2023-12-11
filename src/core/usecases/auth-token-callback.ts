import jwt from 'jsonwebtoken';
import { TRANSFER_EXP_PROCESS_IN_SECONDS } from 'utils/settings';
import { AppLogger } from 'utils/logger';
import { ICacheService, ISfcDataSpace } from './interfaces';

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
    private sfcDataSpace: ISfcDataSpace,
    private cacheService: ICacheService
  ) {}

  async execute(input: TransferCallbackInput) {
    logger.info('Caching auth code and keys...');

    const { authKey, authCode } = input;

    const assetId = await this.sfcDataSpace.getAssetIdFromTransferProcess(
      input.id
    );
    if (!assetId) return;

    const expTimeInSeconds = this.getExpTimeFromToken(input.authCode);

    const carbonFootprintData = await this.sfcDataSpace.fetchCarbonFootprint(
      authKey,
      authCode
    );

    await this.cacheService.storeItem(
      assetId,
      carbonFootprintData,
      expTimeInSeconds
    );

    logger.info('Successfully stored auth code in redis');
  }

  private getExpTimeFromToken(authCode: string) {
    const res = jwt.decode(authCode, { complete: true });
    let expTimeInSeconds = TRANSFER_EXP_PROCESS_IN_SECONDS;

    if (typeof res?.payload === 'object' && res?.payload.exp) {
      const expTime = res.payload.exp;
      const now = +new Date();
      expTimeInSeconds = (expTime * 1000 - now) / 1000;
      expTimeInSeconds = Math.round(expTimeInSeconds);
    }
    return expTimeInSeconds;
  }
}
