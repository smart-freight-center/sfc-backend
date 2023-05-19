import { KeyCloackClient } from 'clients/keycloak-client';
import { ListSharedAssetsUsecsase } from './list-shared-assets';
import { ListCatalogUsecase } from './list-catalog';
import { GenerateTokenUsecase } from './generate-token';
import { edcAdapter, edcTransferService, SFCAPI } from 'participants/clients';
import { InitiateFileTransferUsecase } from './initiate-file-transfer';
import { GetFileUsecase } from './get-file';
import { CacheService } from 'clients';
import { ShareFootprintUsecase } from './share-footprint';
import { DataSourceService } from 'participants/clients';
import { DeleteFootprintUsecase } from './delete-fooprint';
import { InitiateBatchRequestUsecase } from './initiate-batch-request';
import { AuthTokenCallbackUsecase } from './auth-token-callback';

export const provideFootprintUsecase = new ListSharedAssetsUsecsase(edcAdapter);
export const deleteFootprintUsecase = new DeleteFootprintUsecase(edcAdapter);
export const shareFootprintUsecase = new ShareFootprintUsecase(
  edcAdapter,
  DataSourceService,
  SFCAPI
);

export const consumeFootprintUsecase = new ListCatalogUsecase(
  edcAdapter,
  SFCAPI
);
export const generateTokenUsecase = new GenerateTokenUsecase(KeyCloackClient);
export const initiateFileTransferUsecase = new InitiateFileTransferUsecase(
  edcTransferService,
  SFCAPI,
  CacheService
);

export const initiateBatchRequestUsecase = new InitiateBatchRequestUsecase(
  edcTransferService,
  SFCAPI,
  CacheService
);

export const getFileUsecase = new GetFileUsecase(edcAdapter, CacheService);
export const authTokenCallbackUsecase = new AuthTokenCallbackUsecase(
  edcAdapter,
  CacheService
);
