import { EdcAdapter } from '../clients/edc-client';
export class ProvideFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async list() {
    const sharedContracts =
      (await this.edcClient.queryAllContractDefinitions()) as any;
    return sharedContracts.map((contract) => {
      return {
        createdAt: contract.createdAt,
        shipmentId: contract.id.split('-')[0],
        sharedWith: contract.criteria.map((company) => {
          return company.operandRight.split('-')[1];
        }),
      };
    });
  }
}
