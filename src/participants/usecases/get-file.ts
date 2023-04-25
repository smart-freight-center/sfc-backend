import { EdcAdapter } from 'participants/clients';
import { TransferProcessResponse } from 'entities';
import { globalContext } from 'context';
export class GetFileUsecase {
  readonly dataQueue = [];

  constructor(private edcClient: EdcAdapter) {}

  async pullShipmentData(shipmentId: string) {
    const contextKeys = globalContext.getData(shipmentId);

    const response = await this.edcClient.getTranferedData(
      contextKeys as unknown as TransferProcessResponse
    );
    if (response.body) {
      return response.json();
    }
    throw Error();
  }

  async pullData() {}

  async getTransferProcessResponse(requestInput) {
    const transferProcessResponse = {
      ...requestInput,
      endpoint: this.edcClient.edcClientContext.public,
    };

    const agreement = await this.edcClient.getContractAgreement(
      transferProcessResponse.properties.cid
    );

    globalContext.setData(agreement.assetId, transferProcessResponse);
  }
}
