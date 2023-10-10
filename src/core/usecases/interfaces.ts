import { ShareFootprintInput } from 'entities';
import { EmissionDataModel, Participant } from '../types';

export interface ISfcDataSpace {
  shareAsset(
    provider: Participant,
    consumer: Omit<Participant, 'connection'>,
    input: ShareFootprintInput
  ): Promise<object>;
  unshareFootprint(shipmentId: string, companyId: string): Promise<void>;
  fetchCarbonFootprint(input): Promise<EmissionDataModel[]>;

  startTransferProcess(
    provider: Omit<Participant, 'connection'>,
    contractOffer
  ): Promise<void>;
}

export interface IDataSourceFetcher {
  fetchFootprintData(input: ShareFootprintInput): Promise<string>;
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
