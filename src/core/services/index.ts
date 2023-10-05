export { sfcAPI } from './sfc-api';
export { cacheService } from './cache-service';
export { sfcDataSpace, edcClient, edcTransferService } from './sfc-dataspace';
import { DataSourceService } from './data-source-service';

export const dataSourceService = new DataSourceService();
