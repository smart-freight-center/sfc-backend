import { ShareFootprintInput, ValidateDataModelInput } from 'entities';
import { EmissionDataModel, Participant } from '../types';
import { Offer } from '@think-it-labs/edc-connector-client';

export type ShareDataspaceAssetInput = ShareFootprintInput & {
  provider: Participant;
  consumer: Omit<Participant, 'connection'>;
  numberOfRows: number;
};

export type FootprintMetaData = {
  owner: string;
  numberOfRows: number | string;
  month: number;
  sharedWith: number;
  year: number;
  id: string;
  offer?: Offer;
};

export type SingleAssetDetail = {
  provider: Omit<Participant, 'connection'>;
  assetId: string;
  contractOffer: Offer;
};

export type DeleteAssetInput = {
  year: string;
  month: string;
  companyId: string;
};
export interface ISfcDataSpace {
  shareAsset(input: ShareDataspaceAssetInput): Promise<object>;
  unshareFootprint(
    providerId: string,
    assetToDelete: DeleteAssetInput
  ): Promise<void>;
  fetchCarbonFootprint(
    authKey: string,
    authCode: string
  ): Promise<EmissionDataModel[]>;
  fetchFootprintsMetaData(providerId: string): Promise<FootprintMetaData[]>;
  fetchDataThatProviderHasShared(
    providerUrl: string
  ): Promise<FootprintMetaData[]>;
  startTransferProcess(SingleAssetDetail: SingleAssetDetail): Promise<void>;
  fetchAssetsByMonth(
    connections: Omit<Participant, 'connection'>[],
    filters: { month: number; year: number }
  ): Promise<SingleAssetDetail[]>;
}

export interface IDataSourceFetcher {
  fetchFootprintData(input: ShareFootprintInput): Promise<string>;
}
export interface IDataModelValidator {
  fetchFootprintData(input: ValidateDataModelInput): Promise<string>;
}

export interface ISFCAPIConnection {
  getCompanies(): Promise<Omit<Participant, 'connection'>[]>;
  getMyProfile(): Promise<Participant>;
  getCompany(clientId: string): Promise<Omit<Participant, 'connection'>>;
}
export interface ISFCAPI {
  createConnection(authorization: string): ISFCAPIConnection;
}
export interface ICacheService {
  storeItem(
    key: string,
    data: object,
    expiresInSeconds?: number
  ): Promise<void>;
  retrieve(key: string): Promise<unknown>;
}
