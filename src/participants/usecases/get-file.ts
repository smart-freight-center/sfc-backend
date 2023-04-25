import { EdcAdapter } from 'participants/clients';
import { TransferProcessResponse } from 'entities';
import { CacheServiceType } from 'clients';
import { TRANSFER_EXP_PROCESS_IN_SECONDS } from 'utils/settings';

export class GetFileUsecase {
  readonly dataQueue = [];

  constructor(
    private edcClient: EdcAdapter,
    private cacheService: CacheServiceType
  ) {}

  async pullData(shipmentId: string) {
    const contextKeys = await this.cacheService.retrieve(shipmentId);

    const response = await this.edcClient.getTranferedData(
      contextKeys as TransferProcessResponse
    );
    if (response.body) {
      return response.json();
    }
  }

  async getTransferProcessResponse(requestInput) {
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
  }
}
