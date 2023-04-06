import { Addresses } from './edc-connector-client';

export interface Connector {
  id: string;
  title?: string;
  description?: string;
  maintainer?: string;
  curator?: string;
  catalogId?: string;
  region: string;
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

export enum ContractNegotiationState {
  ERROR = 'ERROR',
  DECLINED = 'DECLINED',
  CONFIRMED = 'CONFIRMED',
  INITIAL = 'INITIAL',
  REQUESTED = 'REQUESTED',
}
