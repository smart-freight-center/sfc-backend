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

      const shipmentAndConsumer = contract.id.slice(0, firstDelimiter);
      const lastDashIdx = shipmentAndConsumer.lastIndexOf('-');

      return {
        id: shipmentAndConsumer,
        shipmentId: shipmentAndConsumer.slice(0, lastDashIdx),
        sharedWith,
        sharingDate: new Date(parseInt(sharingDate)).toLocaleString('en-US'),
      };
    });
  }
}
