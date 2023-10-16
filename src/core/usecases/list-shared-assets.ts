import { ISFCAPI, ISfcDataSpace } from './interfaces';
export class ListSharedAssetsUsecsase {
  constructor(private sfcDataspace: ISfcDataSpace, private sfcUnit: ISFCAPI) {}

  async execute(authorization: string) {
    const provider = await this.sfcUnit
      .createConnection(authorization)
      .getMyProfile();

    return this.sfcDataspace.fetchFootprintsMetaData(provider);
  }
}
