import { EdcAdapter } from '../clients';
import { ListCatalogInput } from 'entities';
import * as builder from '../utils/edc-builder';
import { SFCAPIType } from 'participants/types';
import { validateSchema } from 'utils/helpers';

const listCatalogSchema = {
  clientId: 'min:1|required',
};
export class ListCatalogUsecase {
  constructor(private edcClient: EdcAdapter, private sfcAPI: SFCAPIType) {}

  async execute(authorization: string, input: ListCatalogInput) {
    validateSchema(input, listCatalogSchema);
    const sfcAPISession = await this.sfcAPI.createConnection(authorization);
    const provider = await sfcAPISession.getCompany(input.clientId);
    const catalog = await this.edcClient.listCatalog({
      providerUrl: provider.connector_data.addresses.protocol + '/data',
      querySpec: this.getQuerySpec(input.shipmentId),
    });

    return catalog.contractOffers.map((contract) => ({
      id: contract.asset?.id,
      name: contract.asset?.properties['asset:prop:name'],
      contentType: contract.asset?.properties['asset:prop:contenttype'],
    }));
  }

  private getQuerySpec(shipmentId?: string) {
    if (shipmentId) {
      return builder.filter('asset:prop:id', shipmentId);
    }
    return undefined;
  }
}
