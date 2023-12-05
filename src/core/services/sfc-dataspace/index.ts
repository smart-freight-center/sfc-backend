import { CLIENT_CONFIG } from 'utils/settings';
import { SfcDataSpace } from './sfc-dataspace';
import { EdcClient } from './edc-client';
import { EdcTransferService } from './edc-transfer-service';

export const edcClient = new EdcClient(CLIENT_CONFIG);
export const sfcDataSpace = new SfcDataSpace(edcClient);
export const edcTransferService = new EdcTransferService(edcClient);
