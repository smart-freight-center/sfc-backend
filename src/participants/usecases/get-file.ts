import { EdcAdapter } from 'participants/clients';
import { SFCAPIType } from 'participants/types';
import { TransferProcessResponse } from 'entities';
export class GetFileUsecase {
  constructor(private edcClient: EdcAdapter, private sfcAPI: SFCAPIType) {}
  async pullData(transferProcessResponse: TransferProcessResponse) {
    // FIXME(@OlfaBensoussia): This will be removed once we get an event system in place. The value of this object need to be retrieved from the receiver endpoint

    const response = await this.edcClient.getTranferedData(
      transferProcessResponse
    );
    return response;
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
      console.log('transferProcessResponse');
      // socketio.emit("received-callback", {
      //   connectorId: context.params.connectorId,
      //   body: transferProcessResponse,
      // });
    }
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
