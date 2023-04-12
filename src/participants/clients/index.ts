import { CLIENT_CONFIG } from 'utils/settings';
import { EdcAdapter } from './edc-client';
import { SocketIO } from './socket-io';
import { SFCAPI } from './sfc-api';
import { apiServer } from 'server';

export const edcAdapter = new EdcAdapter(CLIENT_CONFIG, 'token');
export const socketIO = new SocketIO(apiServer);
export { EdcAdapter, SocketIO, SFCAPI };
