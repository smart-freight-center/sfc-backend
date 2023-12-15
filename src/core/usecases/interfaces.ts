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

type TransferProcessDetailInput = {
  provider: Omit<Participant, 'connection'>;
  assetId: string;
  contractOffer: Offer;
};

export type SingleAssetDetail = TransferProcessDetailInput & {
  footprintData: FootprintMetaData;
};

export type DeleteAssetInput = {
  year: string;
  month: string;
  companyId: string;
};

export type TransferCallbackInput = {
  id: string;
  endpoint: string;
  authKey: 'Authorization';
  authCode: string;
};

export type MonthFilter = { month: number; year: number };
export interface ISfcDataSpace {
  shareAsset(input: ShareDataspaceAssetInput): Promise<object>;
  getAssetIdFromTransferProcess(
    transferProcessId: string
  ): Promise<string | null>;
  unshareFootprint(
    providerId: string,
    assetToDelete: DeleteAssetInput
  ): Promise<void>;
  fetchCarbonFootprint(
    input: TransferCallbackInput
  ): Promise<EmissionDataModel[]>;
  fetchSharedFootprintsMetaData(
    providerId: string
  ): Promise<FootprintMetaData[]>;
  startTransferProcess(
    SingleAssetDetail: Omit<SingleAssetDetail, 'footprintData'>
  ): Promise<void>;
  fetchReceivedAssets(
    connections: Omit<Participant, 'connection'>[],
    currentParticipantClientId: string,
    filters?: MonthFilter
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
