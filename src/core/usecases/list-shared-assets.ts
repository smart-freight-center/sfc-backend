import { paginate } from 'utils/paginate';
import { ISFCAPI, ISfcDataSpace } from './interfaces';
import { validatePaginationQuery } from 'utils/helpers';
export class ListSharedAssetsUsecsase {
  constructor(private sfcDataspace: ISfcDataSpace, private sfcUnit: ISFCAPI) {}

  async execute(authorization: string, query) {
    const provider = await this.sfcUnit
      .createConnection(authorization)
      .getMyProfile();

    const { page, perPage } = validatePaginationQuery(query);
    const items = await this.sfcDataspace.fetchFootprintsMetaData(
      provider.client_id
    );

    return paginate(items, { page, perPage, total: items.length });
  }
}
