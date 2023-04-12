import { EdcAdapter, SocketIO } from 'participants/clients';
import { SFCAPIType } from 'participants/types';
import { TransferProcessResponse } from 'entities';
import { EMITTED_MESSAGE } from 'participants/utils/constants';
export class GetFileUsecase {
  constructor(
    private edcClient: EdcAdapter,
    private sfcAPI: SFCAPIType,
    private socketIO: SocketIO
  ) {}
  async pullData() {
    this.socketIO.receive(
      EMITTED_MESSAGE,
      async (transferProcessResponse: TransferProcessResponse) => {
        console.log('socket io input', transferProcessResponse);
        const response = await this.edcClient.getTranferedData(
          transferProcessResponse
        );
        return response;
      }
    );
    return;
  }

  async getTransferProcessResponse(
    requestInput,
    companyId: string,
    authorization: string
  ) {
    const provider = await this.getProvider(authorization, companyId);

    if (requestInput) {
      const transferProcessResponse = {
        ...requestInput,
        endpoint: `${provider.connector_data.addresses.public}/public/`,
      };
      this.socketIO.emit(EMITTED_MESSAGE, transferProcessResponse);
    }
    // for testing
    this.socketIO.emit(EMITTED_MESSAGE, 'holla');
  }

  //FIXME(@OlfaBensoussia): this is redundant as we had to define the same method in 'initiate-file-transfer.ts'
  // needs refactoring
  private async getProvider(authorization: string, companyId: string) {
    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );

    const provider = await sfcConnection.getCompany(companyId);
    return provider;
  }
}
