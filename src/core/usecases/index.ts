import { edcAdapter } from '../../core/clients';
import { ProvideFootprintUsecase } from './provide-footprint';
import { ConsumeFootprintUsecase } from './consume-footprint';

export const provideFootprintUsecase = new ProvideFootprintUsecase(edcAdapter);
export const consumeFootprintUsecase = new ConsumeFootprintUsecase(edcAdapter);
