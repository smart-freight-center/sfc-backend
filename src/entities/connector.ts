import { Addresses } from './edc-connector-client';

export interface Connector {
  id: string;
  title?: string;
  description?: string;
  maintainer?: string;
  curator?: string;
  catalogId?: string;
  region?: string;
  token?: string;
  addresses: Addresses;
}

export interface ConnectorInput {
  id: string;
  title?: string;
  description?: string;
  maintainer?: string;
  curator?: string;
  catalogId: string;
  region: string;
}

export const IDS_PROTOCOL = 'ids-multipart';
export enum DataAddressType {
  HttpType = 'HttpProxy',
}

export type ContractNegotiationState =
  | 'INITIAL'
  | 'REQUESTING'
  | 'REQUESTED'
  | 'AGREEING'
  | 'AGREED'
  | 'TERMINATED'
  | 'ERROR'
  | 'FINALIZING'
  | 'VERIFYING'
  | 'FINALIZED'
  | 'VERIFIED';

export const COMPLETED_NEGOTIATION_STATES = new Set<ContractNegotiationState>([
  'FINALIZED',
  'TERMINATED',
]);
