import { KeyCloackClient } from 'clients/keycloak-client';
import { ListSharedAssetsUsecsase } from './list-shared-assets';
import { RetrieveFootprintMetaUsecase } from './retrieve-footprint-meta';
import { GenerateTokenUsecase } from './generate-token';
import {
  sfcAPI,
  cacheService,
  dataSourceService,
  sfcDataSpace,
  edcClient,
} from 'core/services';
import { GetEmissionsUsecase } from './get-emissions';
import { ShareFootprintUsecase } from './share-footprint';
import { DeleteFootprintUsecase } from './delete-fooprint';
import { AuthTokenCallbackUsecase } from './auth-token-callback';
import { InitiateDataTransferByMonthUsecase } from './initiate-data-transfer-by-month';
export { TransferByMonthInput } from './initiate-data-transfer-by-month';

import { ValidateDataModelUsecase } from './validate-data-model';
import { RunValidationOnRawFileUsecase } from './run-validation-on-raw-file';
import { RetrieveUsageMetricsUsecase } from './retrieve-usage-metrics';

export const provideFootprintUsecase = new ListSharedAssetsUsecsase(
  sfcDataSpace,
  sfcAPI
);

export const retrieveMetricsUsecase = new RetrieveUsageMetricsUsecase(
  sfcDataSpace,
  sfcAPI
);

export const deleteFootprintUsecase = new DeleteFootprintUsecase(
  sfcAPI,
  sfcDataSpace
);

export const shareFootprintUsecase = new ShareFootprintUsecase(
  sfcDataSpace,
  dataSourceService,
  sfcAPI
);

export const validateDataModelUsecase = new ValidateDataModelUsecase(
  dataSourceService
);

export const runValidationOnRawFileUsecase =
  new RunValidationOnRawFileUsecase();

export const retrieveFootprintsUsecase = new RetrieveFootprintMetaUsecase(
  edcClient,
  sfcAPI
);
export const generateTokenUsecase = new GenerateTokenUsecase(KeyCloackClient);

export const initiateTransferByMonth = new InitiateDataTransferByMonthUsecase(
  sfcAPI,
  cacheService,
  sfcDataSpace
);

export const getEmissionsUsecase = new GetEmissionsUsecase(cacheService);

export const authTokenCallbackUsecase = new AuthTokenCallbackUsecase(
  sfcDataSpace,
  cacheService
);
