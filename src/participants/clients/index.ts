import { CLIENT_CONFIG } from 'utils/settings';
import { EdcAdapter } from './edc-client';
import { SocketIO } from './socket-io';
import { SFCAPI } from './sfc-api';

export const edcAdapter = new EdcAdapter(CLIENT_CONFIG, 'token');

export { EdcAdapter, SocketIO, SFCAPI };
