import { validateSchema } from 'utils/helpers';
import { EdcAdapter } from '../clients/edc-client';
import * as builder from 'participants/utils/edc-builder';
import { ContractDefinition } from '@think-it-labs/edc-connector-client';

export class DeleteFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async execute(shipmentId: string) {
    await validateSchema({ shipmentId }, { shipmentId: 'required|string' });

    const contracts = await this.getContractdefintions(shipmentId);

    await this.deleteContractOffers(contracts);
  }

  private async getContractdefintions(shipmentId: string) {
    const filter = builder.shipmentFilter('id', `${shipmentId}%`, 'LIKE');
    const contracts = await this.edcClient.queryAllContractDefinitions(filter);
    return contracts;
  }

  private async deleteContractOffers(contracts: ContractDefinition[]) {
    for (const contract of contracts) {
      await this.edcClient.deleteContractDefinition(contract.id);
    }
  }
}
