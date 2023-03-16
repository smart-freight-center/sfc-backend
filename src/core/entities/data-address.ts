import {
  AzureStorageDataAddress as ClientAzureStorageDataAddress,
  BaseDataAddress as ClientBaseDataAddress,
  HttpDataAddress as ClientHttpDataAddress,
  S3StorageDataAddress as ClientS3StorageDataAddress,
} from '@think-it-labs/edc-connector-client';

export interface BaseDataAddress extends ClientBaseDataAddress {
  uid: string;
}

export interface AzureStorageDataAddress extends ClientAzureStorageDataAddress {
  uid: string;
}

export interface HttpDataAddress extends ClientHttpDataAddress {
  uid: string;
}

export interface S3StorageDataAddress extends ClientS3StorageDataAddress {
  uid: string;
}

export type DataAddress =
  | BaseDataAddress
  | HttpDataAddress
  | S3StorageDataAddress
  | AzureStorageDataAddress;

export type BaseDataAddressInput = Omit<BaseDataAddress, 'uid'>;
export type HttpDataAddressInput = Omit<HttpDataAddress, 'uid'>;
export type S3StorageDataAddressInput = Omit<S3StorageDataAddress, 'uid'>;
export type AzureStorageDataAddressInput = Omit<AzureStorageDataAddress, 'uid'>;

export type DataAddressInput =
  | BaseDataAddressInput
  | HttpDataAddressInput
  | S3StorageDataAddressInput
  | AzureStorageDataAddressInput;

export type ShareFootprintInput = {
    shipmentId: string;
    dataAddress?: DataAddress;
  };