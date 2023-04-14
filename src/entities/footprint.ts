import { DataAddress } from './data-address';

export type ShareFootprintInput = {
  shipmentId: string;
  type: 'azure' | 'http' | 's3';
  dataAddress: DataAddress;
};

export interface ListCatalogInput {
  clientId: string;
  shipmentId?: string;
}

export type ContractNegotiationInput = {
  clientId: string;
  shipmentId: string;
};
