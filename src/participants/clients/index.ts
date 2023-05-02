import { CLIENT_CONFIG } from 'utils/settings';
import { EdcAdapter } from './edc-client';
export { SFCAPI } from './sfc-api';
export * from './data-source-service';
export const edcAdapter = new EdcAdapter(CLIENT_CONFIG, 'token');
export { EdcAdapter };
