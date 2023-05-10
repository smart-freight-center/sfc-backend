import { EdcAdapter } from 'participants/clients';
import { TransferProcessResponse } from 'entities';
import { CacheServiceType } from 'clients';
import { TRANSFER_EXP_PROCESS_IN_SECONDS } from 'utils/settings';
import { TransferNotInitiated } from 'utils/error';

export class GetFileUsecase {
  readonly dataQueue = [];

  constructor(
    private edcClient: EdcAdapter,
    private cacheService: CacheServiceType
  ) {}

  async pullData(shipmentId: string) {
    const contextKeys = await this.getTransferKeys(shipmentId);
    console.log("contextKeys : ", contextKeys)
    const response = await this.edcClient.getTranferedData(contextKeys);
    if (response.body) {
      return response.json();
    }
  }

  private async getTransferKeys(shipmentId: string) {
    const contextKeys = await this.cacheService.retrieve(shipmentId);

    if (!contextKeys) throw new TransferNotInitiated(shipmentId);
    return contextKeys as TransferProcessResponse;
  }

  async getTransferProcessResponse(requestInput) {
    const transferProcessResponse = {
      ...requestInput,
      endpoint: this.edcClient.edcClientContext.public,
    };

    console.log("transferProcessResponse : ", transferProcessResponse)
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
