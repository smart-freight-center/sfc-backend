import { EdcClient } from 'core/services/sfc-dataspace/edc-client';
import { ISFCAPI, ISfcDataSpace } from './interfaces';
import { AppLogger } from 'utils/logger';
import { validatePaginationQuery } from 'utils/helpers';
import { paginate } from 'utils/paginate';

type FootprintData = {
  owner: string;
  month: number;
  year: number;
  sharedWith: string;
  id: string;
};
const logger = new AppLogger('RetrieveFootprintMetaUsecase');
export class RetrieveFootprintMetaUsecase {
  constructor(
    private edcClient: EdcClient,
    private sfcDataSpace: ISfcDataSpace,
    private sfcAPI: ISFCAPI
  ) {}

  async execute(authorization: string, query) {
    logger.info('Retrieving footprints that we have access to...');
    const sfcAPISession = await this.sfcAPI.createConnection(authorization);

    const { page, perPage } = validatePaginationQuery(query);

    const companies = await sfcAPISession.getCompanies();
    const myProfile = await sfcAPISession.getMyProfile();

    // const items = await this.sfcDataSpace.fetchReceivedAssets(
    //   companies,
    //   myProfile.client_id
    // );
    const companyProtocols = companies.map(
      (company) => company.connector_data.addresses.protocol as string
    );

    const items = await this.getItemsThatHasBeenSharedWithMe(companyProtocols);

    return paginate(items, {
      page,
      perPage,
      total: items.length,
    });
  }

  private async getItemsThatHasBeenSharedWithMe(providerUrls: string[]) {
    let receivedFootprints: FootprintData[] = [];

    for (const providerUrl of providerUrls) {
      const catalog = await this.edcClient.listCatalog({
        providerUrl,
      });

      const dataReceivedFromThisProvider = catalog.datasets.map((dataset) => {
        return {
          owner: dataset.mandatoryValue('edc', 'owner'),
          month: dataset.mandatoryValue('edc', 'month'),
          sharedWith: dataset.mandatoryValue('edc', 'sharedWith'),
          year: dataset.mandatoryValue('edc', 'year'),
          id: dataset.mandatoryValue('edc', 'id'),
        } as FootprintData;
      });

      receivedFootprints = receivedFootprints.concat(
        dataReceivedFromThisProvider
      );
    }

    return receivedFootprints;
  }
}
