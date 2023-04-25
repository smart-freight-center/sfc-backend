import { KeyCloackClient } from 'clients/keycloak-client';
import { ProvideFootprintUsecase } from './provide-footprint';
import { ListCatalogUsecase } from './list-catalog';
import { GenerateTokenUsecase } from './generate-token';
import { edcAdapter, SFCAPI } from 'participants/clients';
import { InitiateFileTransferUsecase } from './initiate-file-transfer';
import { GetFileUsecase } from './get-file';
import { CacheService } from 'clients';

export const provideFootprintUsecase = new ProvideFootprintUsecase(edcAdapter);
export const consumeFootprintUsecase = new ListCatalogUsecase(
  edcAdapter,
  SFCAPI
);
export const generateTokenUsecase = new GenerateTokenUsecase(KeyCloackClient);
export const initiateFileTransferUsecase = new InitiateFileTransferUsecase(
  edcAdapter,
  SFCAPI
);
export const getFileUsecase = new GetFileUsecase(edcAdapter, CacheService);
