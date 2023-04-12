import { EdcAdapter } from 'participants/clients';

export class GetFileUsecase {
  constructor(private edcClient: EdcAdapter) {}
  async execute() {
    // FIXME(@OlfaBensoussia): This will be removed once we get an event system in place. The value of this object need to be retrieved from the receiver endpoint
    const TransferProcessResponse = {
      id: 'string',
      endpoint: 'string',
      contractId: 'string',
      authKey: 'string',
      authCode: 'string',
    };
    const response = await this.edcClient.getTranferedData(
      TransferProcessResponse
    );
    return response;
  }
}
