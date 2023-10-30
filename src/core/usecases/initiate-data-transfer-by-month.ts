import { Participant } from 'core/types';
import { validateData } from 'utils/helpers';
import { AppLogger } from 'utils/logger';
import { TRANSFER_EXP_PROCESS_IN_SECONDS } from 'utils/settings';
import { ICacheService, ISFCAPI, ISfcDataSpace } from './interfaces';
import { Offer } from '@think-it-labs/edc-connector-client';
import { initiateDataTransferByMonth } from 'core/validators';
import { ShipmentForMonthNotFound } from 'utils/errors';

export type TransferByMonthInput = {
  month: number;
  year: number;
};

type SingleAssetDetail = {
  provider: Omit<Participant, 'connection'>;
  assetId: string;
  contractOffer: Offer;
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

    const connections = await this.getConnections(authorization);
    const assetDetails = await this.sfcDataSpace.fetchAssetsByMonth(
      connections,
      validated
    );
    this.throwErrorIfThereAreNoAssets(assetDetails);

    const assetIds = await this.startTransferOnAllAssets(assetDetails);

    const jobId = this.generateJobId(validated);

    await this.cacheAssetIds(jobId, assetIds);

    logger.info('Successfully initited file transfer');

    return jobId;
  }

  private async getConnections(authorization: string) {
    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );

    const connections = await sfcConnection.getCompanies();
    return connections;
  }

  private throwErrorIfThereAreNoAssets(assetDetails: SingleAssetDetail[]) {
    if (assetDetails.length === 0) throw new ShipmentForMonthNotFound();
  }

  private async startTransferOnAllAssets(assetDetails: SingleAssetDetail[]) {
    const assetIds: string[] = [];
    for (const assetDetail of assetDetails) {
      assetIds.push(assetDetail.assetId);
      await this.sfcDataSpace.startTransferProcess(assetDetail);
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
