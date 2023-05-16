import { validateSchema } from 'utils/helpers';
import { EdcAdapter } from '../clients/edc-client';
import * as builder from 'participants/utils/edc-builder';
import { ContractDefinition } from '@think-it-labs/edc-connector-client';
import { ContractNotFound } from 'utils/error';

export class DeleteFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async execute(shipmentId: string, companyId: string) {
    await validateSchema({ shipmentId }, { shipmentId: 'required|string' });

    const contracts = await this.getContractdefintions(shipmentId, companyId);
    if (!contracts?.length) {
      throw new ContractNotFound();
    }
    await this.deleteContractOffers(contracts);
  }

  private async getContractdefintions(shipmentId: string, companyId: string) {
    const filter = builder.shipmentFilter(
      'id',
      companyId ? `${shipmentId}-${companyId}%` : `${shipmentId}%`,
      'LIKE'
    );
    const contracts = await this.edcClient.queryAllContractDefinitions(filter);
    return contracts.filter((contract) => contract.id.startsWith(shipmentId));
  }

  private async deleteContractOffers(contracts: ContractDefinition[]) {
    for (const contract of contracts) {
      await this.edcClient.deleteContractDefinition(contract.id);
    }
  }
}
