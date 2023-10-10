import { DataAddress } from '@think-it-labs/edc-connector-client';

export type ShareFootprintInput = {
  shipmentId: string;
  companyId: string;
  dateCreated?: string;
  type: 'azure' | 'http' | 's3';
  dataLocation: Omit<DataAddress, 'contentType'>;
  contentType?: string;
};

export interface ListCatalogInput {
  companyId: string;
  shipmentId?: string;
}

export type ContractNegotiationInput = {
  companyId: string;
  shipmentId: string;
};
