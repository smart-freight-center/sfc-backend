import { KeyCloackClient } from 'clients/keycloak-client';
import { ListSharedAssetsUsecsase } from './list-shared-assets';
import { ListCatalogUsecase } from './list-catalog';
import { GenerateTokenUsecase } from './generate-token';
import {
  SFCAPI,
  cacheService,
  dataSourceService,
  sfcDataSpace,
  edcClient,
  edcTransferService,
} from 'core/services';
import { InitiateFileTransferUsecase } from './initiate-file-transfer';
import { GetEmissionsUsecase } from './get-emissions';
import { ShareFootprintUsecase } from './share-footprint';
import { DeleteFootprintUsecase } from './delete-fooprint';
import { InitiateBatchRequestUsecase } from './initiate-batch-request';
import { AuthTokenCallbackUsecase } from './auth-token-callback';

export const provideFootprintUsecase = new ListSharedAssetsUsecsase(edcClient);
export const deleteFootprintUsecase = new DeleteFootprintUsecase(sfcDataSpace);
export const shareFootprintUsecase = new ShareFootprintUsecase(
  sfcDataSpace,
  dataSourceService,
  SFCAPI
);

export const consumeFootprintUsecase = new ListCatalogUsecase(
  edcClient,
  SFCAPI
);
export const generateTokenUsecase = new GenerateTokenUsecase(KeyCloackClient);
export const initiateFileTransferUsecase = new InitiateFileTransferUsecase(
  edcTransferService,
  SFCAPI,
  cacheService,
  sfcDataSpace
);

export const initiateBatchRequestUsecase = new InitiateBatchRequestUsecase(
  edcTransferService,
  SFCAPI,
  cacheService
);

export const getEmissionsUsecase = new GetEmissionsUsecase(
  sfcDataSpace,
  cacheService
);

export const authTokenCallbackUsecase = new AuthTokenCallbackUsecase(
  edcClient,
  cacheService
);
