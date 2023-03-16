import { CLIENT_CONFIG } from '../../utils/settings';
import { EdcAdapter } from './EdcClient';

export const edcAdapter = new EdcAdapter(CLIENT_CONFIG, 'token');
