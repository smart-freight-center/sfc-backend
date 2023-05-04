import { DataAddress } from './data-address';

export type ShareFootprintInput = {
  shipmentId: string;
  companyId: string;
  type: 'azure' | 'http' | 's3';
  dataLocation: Omit<DataAddress, 'contentType'>;
  contentType?: string;
};

export interface ListCatalogInput {
  clientId: string;
  shipmentId?: string;
}

export type ContractNegotiationInput = {
  clientId: string;
  shipmentId: string;
};
