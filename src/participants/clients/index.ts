import { CLIENT_CONFIG } from 'utils/settings';
import { EdcAdapter } from './edc-client';
import { SFCAPI } from './sfc-api';

export const edcAdapter = new EdcAdapter(CLIENT_CONFIG, 'token');

export { EdcAdapter, SFCAPI };
