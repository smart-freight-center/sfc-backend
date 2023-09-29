import { ListCatalogInput } from 'entities';
import * as builder from '../utils/edc-builder';
import { SFCAPIType } from 'core/types';
import { validateSchema } from 'utils/helpers';
import { EdcClient } from 'core/services/sfc-dataspace/edc-client';

const listCatalogSchema = {
  companyId: 'min:1|required',
};
export class ListCatalogUsecase {
  constructor(private edcClient: EdcClient, private sfcAPI: SFCAPIType) {}

  async execute(authorization: string, input: ListCatalogInput) {
    validateSchema(input, listCatalogSchema);
    const sfcAPISession = await this.sfcAPI.createConnection(authorization);
    const provider = await sfcAPISession.getCompany(input.companyId);
    const catalog = await this.edcClient.listCatalog({
      providerUrl: provider.connector_data.addresses.protocol + '/data',
      querySpec: this.getQuerySpec(input.shipmentId),
    });
    return catalog.contractOffers.map((contract) => {
      const assetId = contract.asset?.id || '';
      const createdDelimiter = assetId.lastIndexOf('__');
      const idWithClient = assetId.slice(0, createdDelimiter);

      const companyIdDelimiter = idWithClient.lastIndexOf('-');

      return {
        id: idWithClient?.slice(0, companyIdDelimiter),
        name: contract.asset?.properties['asset:prop:name'],
        owner: contract.asset?.properties['asset:prop:owner'],
      };
    });
  }

  private getQuerySpec(shipmentId?: string) {
    if (shipmentId) {
      return builder.shipmentFilter('asset:prop:id', `${shipmentId}%`, 'LIKE');
    }
    return undefined;
  }
}
