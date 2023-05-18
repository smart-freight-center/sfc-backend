import { EdcAdapter } from '../clients/edc-client';
export class ListSharedAssetsUsecsase {
  constructor(private edcClient: EdcAdapter) {}

  async execute() {
    const sharedContracts = await this.edcClient.queryAllContractDefinitions();
    return sharedContracts.map((contract) => {
      const firstDelimiter = contract.id.indexOf('__');
      const substring = contract.id.slice(0, firstDelimiter);
      const lastDateDelimiter = contract.id.lastIndexOf('_');
      const sharingDate = contract.id.slice(
        firstDelimiter + 2,
        lastDateDelimiter
      );
      const sharedWithIdx = substring.lastIndexOf('-');
      const sharedWith = substring.slice(sharedWithIdx + 1);
      return {
        id: substring.slice(0, sharedWithIdx),
        shipmentId: contract.id.split('-')[0],
        sharedWith,
        sharingDate: new Date(parseInt(sharingDate)).toLocaleString('en-US'),
      };
    });
  }
}