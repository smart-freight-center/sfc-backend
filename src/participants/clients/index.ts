import { CLIENT_CONFIG, CONNECTOR_TOKEN } from 'utils/settings';
import { EdcAdapter } from './edc-client';
import { EdcTransferService } from './edc-transfer-service';
export { SFCAPI } from './sfc-api';
export * from './data-source-service';
export const edcAdapter = new EdcAdapter(CLIENT_CONFIG, CONNECTOR_TOKEN);

export const edcTransferService = new EdcTransferService(edcAdapter);

export { EdcAdapter };
