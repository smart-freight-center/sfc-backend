import { KeyCloackClient } from './clients/KeyCloackClient';

export type KeyCloackClientType = typeof KeyCloackClient;
export type TokenInput = Partial<{
  grant_type: string;
  client_id: string;
  client_secret: string;
}>;
