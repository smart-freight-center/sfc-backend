import { DataAddress } from '@think-it-labs/edc-connector-client';

export type ShareFootprintInput = {
  month: number;
  year: number;
  companyId: string;
  dateCreated?: string;
  type: 'azure' | 'http' | 's3' | string;
  dataLocation: Omit<DataAddress, 'contentType'>;
};

export type ValidateDataModelInput = {
  month: number;
  year: number;
  dateCreated?: string;
  type: 'azure' | 'http' | 's3' | string;
  dataLocation: Omit<DataAddress, 'contentType'>;
};

export interface ListCatalogInput {
  companyId: string;
}

export type ContractNegotiationInput = {
  companyId: string;
  shipmentId: string;
};
