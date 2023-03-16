import { edcAdapter } from '../../core/clients';
import { ShareFootprintUsecase } from './share-footprint';

export const shareFootprintUsecase = new ShareFootprintUsecase(edcAdapter);
