import { KeyCloackClient } from './keycloak-client';

export type KeyCloackClientType = typeof KeyCloackClient;
export type TokenInput = {
  grant_type: string;
  username: string;
  password: string;
};
