import { KeyCloackClient } from 'clients/keycloak-client';
import { ProvideFootprintUsecase } from './provide-footprint';
import { ConsumeFootprintUsecase } from './consume-footprint';
import { GenerateTokenUsecase } from './generate-token';
import { edcAdapter } from 'participants/clients';
import { InitiateFileTransferUsecase } from './initiate-file-transfer';
import { SFCAPI } from 'participants/clients/sfc-api';
import { GetFileUsecase } from './get-file';

export const provideFootprintUsecase = new ProvideFootprintUsecase(edcAdapter);
export const consumeFootprintUsecase = new ConsumeFootprintUsecase(edcAdapter);
export const generateTokenUsecase = new GenerateTokenUsecase(KeyCloackClient);
export const initiateFileTransferUsecase = new InitiateFileTransferUsecase(
  edcAdapter,
  SFCAPI
);
export const getFileUsecase = new GetFileUsecase(edcAdapter, SFCAPI);
