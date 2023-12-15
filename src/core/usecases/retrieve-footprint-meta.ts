import { ISFCAPI, ISfcDataSpace } from './interfaces';
import { AppLogger } from 'utils/logger';
import { validatePaginationQuery } from 'utils/helpers';
import { paginate } from 'utils/paginate';

const logger = new AppLogger('RetrieveFootprintMetaUsecase');
export class RetrieveFootprintMetaUsecase {
  constructor(private sfcDataSpace: ISfcDataSpace, private sfcAPI: ISFCAPI) {}

  async execute(authorization: string, query) {
    logger.info('Retrieving footprints that we have access to...');
    const sfcAPISession = await this.sfcAPI.createConnection(authorization);

    const { page, perPage } = validatePaginationQuery(query);

    const companies = await sfcAPISession.getCompanies();

    const myProfile = await sfcAPISession.getMyProfile();

    const items = await this.sfcDataSpace.fetchReceivedAssets(
      companies,
      myProfile.client_id
    );
    const footprintData = items.map((item) => ({
      owner: item.footprintData.owner,
      month: Number(item.footprintData.month),
      sharedWith: item.footprintData.sharedWith,
      numberOfRows: Number(item.footprintData.numberOfRows),
      year: Number(item.footprintData.year),
      id: item.footprintData.id,
    }));

    return paginate(footprintData, {
      page,
      perPage,
      total: items.length,
    });
  }
}
