import { validateSchema } from 'utils/helpers';
import { EdcAdapter } from '../clients/edc-client';
import * as builder from 'participants/utils/edc-builder';
import { ContractNotFound } from 'utils/error';
import { ContractOffer } from 'entities';

export class DeleteFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async execute(shipmentId: string) {
    await validateSchema({ shipmentId }, { shipmentId: 'required|string' });

    const offers = await this.getContractOffers(shipmentId);

    await this.deleteContractOffers(offers);
  }

  private async getContractOffers(shipmentId: string) {
    const assetFilter = builder.shipmentFilter(
      'asset:prop:id',
      `${shipmentId}%`,
      'LIKE'
    );

    const catalogs = await this.edcClient.listCatalog({
      providerUrl: `${this.edcClient.edcClientContext.protocol}/data`,
      querySpec: assetFilter,
    });

    const filteredContracts = catalogs?.contractOffers.filter((offer) =>
      offer.asset?.id.startsWith(shipmentId)
    );

    if (!filteredContracts.length) throw new ContractNotFound();
    return filteredContracts;
  }

  private async deleteContractOffers(offers: ContractOffer[]) {
    for (const offer of offers) {
      const contractId = offer.id?.split(':')[0];
      await this.edcClient.deleteContractDefinition(contractId as string);
    }
  }
}
