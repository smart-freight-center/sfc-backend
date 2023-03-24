import { KeyCloackClient } from 'core/clients/KeyCloackClient';
import { edcAdapter } from '../../core/clients';
import { ProvideFootprintUsecase } from './provide-footprint';
import { ConsumeFootprintUsecase } from './consume-footprint';
import { GenerateTokenUsecase } from './generate-token-usecase';

export const provideFootprintUsecase = new ProvideFootprintUsecase(edcAdapter);
export const consumeFootprintUsecase = new ConsumeFootprintUsecase(edcAdapter);

export const generateTokenUsecase = new GenerateTokenUsecase(KeyCloackClient);
