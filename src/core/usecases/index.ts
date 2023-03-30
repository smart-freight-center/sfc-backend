import { KeyCloackClient } from 'core/clients/KeyCloackClient';
import { ParticipantGateway } from 'core/dataGateways';
import { edcAdapter } from '../../core/clients';
import { ProvideFootprintUsecase } from './provide-footprint';
import { ConsumeFootprintUsecase } from './consume-footprint';
import { GenerateTokenUsecase } from './generate-token';
import { RetrieveCompaniesConnection } from './retrieve-companies';

export const provideFootprintUsecase = new ProvideFootprintUsecase(edcAdapter);
export const consumeFootprintUsecase = new ConsumeFootprintUsecase(edcAdapter);

export const generateTokenUsecase = new GenerateTokenUsecase(KeyCloackClient);
export const retrieveCompaniesConnectionUsecase =
  new RetrieveCompaniesConnection(ParticipantGateway);
