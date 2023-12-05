import { paginate } from 'utils/paginate';
import { ISFCAPI, ISfcDataSpace } from './interfaces';
import { validatePaginationQuery } from 'utils/helpers';
import { AppLogger } from 'utils/logger';
const logger = new AppLogger('ShareFootprintUsecase');

export class ListSharedAssetsUsecsase {
  constructor(private sfcDataspace: ISfcDataSpace, private sfcUnit: ISFCAPI) {}

  async execute(authorization: string, query) {
    logger.info('Retrieving assets that I have previously shared...');

    const provider = await this.sfcUnit
      .createConnection(authorization)
      .getMyProfile();

    const { page, perPage } = validatePaginationQuery(query);
    const items = await this.sfcDataspace.fetchSharedFootprintsMetaData(
      provider.client_id
    );

    return paginate(items, { page, perPage, total: items.length });
  }
}
