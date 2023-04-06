import { CLIENT_CONFIG } from 'utils/settings';
import { EdcAdapter } from './edc-client';

export const edcAdapter = new EdcAdapter(CLIENT_CONFIG, 'token');
export { EdcAdapter };
