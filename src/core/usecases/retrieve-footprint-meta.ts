import joi from 'joi';
import { ListCatalogInput } from 'entities';
import { validateData } from 'utils/helpers';
import { EdcClient } from 'core/services/sfc-dataspace/edc-client';
import { ISFCAPI } from './interfaces';
import { AppLogger } from 'utils/logger';

const listCatalogSchema = joi.object({
  companyId: joi.string().required(),
});

const logger = new AppLogger('RetrieveFootprintMetaUsecase');
export class RetrieveFootprintMetaUsecase {
  constructor(private edcClient: EdcClient, private sfcAPI: ISFCAPI) {}

  async execute(authorization: string, input: ListCatalogInput) {
    logger.info('Retrieving footprints that we have access to...');
    const validInput = validateData(listCatalogSchema, input);
    const sfcAPISession = await this.sfcAPI.createConnection(authorization);
    const provider = await sfcAPISession.getCompany(validInput.companyId);
    const catalog = await this.edcClient.listCatalog({
      providerUrl: provider.connector_data.addresses.protocol as string,
    });

    return catalog.datasets.map((dataset) => ({
      owner: dataset.mandatoryValue('edc', 'owner'),
      month: dataset.mandatoryValue('edc', 'month'),
      sharedWith: dataset.mandatoryValue('edc', 'sharedWith'),
      year: dataset.mandatoryValue('edc', 'year'),
      id: dataset.mandatoryValue('edc', 'id'),
    }));
  }
}
