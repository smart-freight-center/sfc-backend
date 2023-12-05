import { validateData } from 'utils/helpers';
import { AppLogger } from 'utils/logger';
import { TRANSFER_EXP_PROCESS_IN_SECONDS } from 'utils/settings';
import {
  ICacheService,
  ISFCAPI,
  ISfcDataSpace,
  SingleAssetDetail,
} from './interfaces';
import { initiateDataTransferByMonth } from 'core/validators';
import { ShipmentForMonthNotFound } from 'utils/errors';

export type TransferByMonthInput = {
  month: number;
  year: number;
};

const logger = new AppLogger('InitiateFileTransferUsecase');

export class InitiateDataTransferByMonthUsecase {
  constructor(
    private sfcAPI: ISFCAPI,
    private cacheService: ICacheService,
    private sfcDataSpace: ISfcDataSpace
  ) {}

  async execute(inputData: TransferByMonthInput, authorization: string) {
    logger.info('Initiating data  transfer by month...', { args: inputData });

    const validated = validateData(initiateDataTransferByMonth, inputData);

    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );

    const connections = await sfcConnection.getCompanies();
    const myProfile = await sfcConnection.getMyProfile();
    const assetDetails = await this.sfcDataSpace.fetchReceivedAssets(
      connections,
      myProfile.client_id,
      validated
    );
    this.throwErrorIfThereAreNoAssets(assetDetails);

    const assetIds = await this.startTransferOnAllAssets(assetDetails);

    const jobId = this.generateJobId(validated);

    await this.cacheAssetIds(jobId, assetIds);

    logger.info('Successfully initited file transfer');

    return jobId;
  }

  private throwErrorIfThereAreNoAssets(assetDetails: SingleAssetDetail[]) {
    if (assetDetails.length === 0) throw new ShipmentForMonthNotFound();
  }

  private async startTransferOnAllAssets(assetDetails: SingleAssetDetail[]) {
    const assetIds: string[] = [];
    for (const assetDetail of assetDetails) {
      assetIds.push(assetDetail.assetId);
      await this.sfcDataSpace.startTransferProcess({
        assetId: assetDetail.assetId,
        provider: assetDetail.provider,
        contractOffer: assetDetail.contractOffer,
      });
    }
    return assetIds;
  }

  private generateJobId(validated: TransferByMonthInput) {
    const monthStr = validated.month.toString().padStart(2, '0');
    const jobId = `${validated.year}-${monthStr}`;
    return jobId;
  }

  private async cacheAssetIds(jobId: string, assetIds: string[]) {
    const cacheValue = { assetIds };

    await this.cacheService.storeItem(
      jobId,
      cacheValue,
      TRANSFER_EXP_PROCESS_IN_SECONDS
    );
  }
}
