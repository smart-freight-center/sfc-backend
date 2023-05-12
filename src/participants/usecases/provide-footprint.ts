import { EdcAdapter } from '../clients/edc-client';
export class ProvideFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async list() {
    const sharedContracts = await this.edcClient.queryAllContractDefinitions();
    return sharedContracts.map((contract) => {
      const firstDelimiter = contract.id.indexOf('__');
      const substring = contract.id.slice(0, firstDelimiter);
      const sharedWithIdx = substring.lastIndexOf('-');
      const sharedWith = substring.slice(sharedWithIdx);
      return {
        id: substring.slice(0, sharedWithIdx),
        shipmentId: contract.id.split('-')[0],
        sharedWith,
      };
    });
  }
}
