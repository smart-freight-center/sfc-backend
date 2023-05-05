import { Addresses } from '@think-it-labs/edc-connector-client';
import { KeyCloackClient } from '../clients/keycloak-client';

export type KeyCloackClientType = typeof KeyCloackClient;
export type TokenInput = Partial<{
  grant_type: string;
  client_id: string;
  client_secret: string;
}>;

export type ParticipantType = {
  company_name: string;
  client_id: string;
  company_BNP: string;
  role: 'shipper' | 'lsp';
  connection: string[];
  public_key: string;
  connector_data: {
    id: string;
    addresses: Addresses;
  };
};
