import sinon, { SinonStubbedInstance } from 'sinon';
import {
  IDataSourceFetcher,
  ISFCAPI,
  ISFCAPIConnection,
  ISfcDataSpace,
} from '../interfaces';

export const mockDataSourceFetcher: SinonStubbedInstance<IDataSourceFetcher> = {
  fetchFootprintData: sinon.stub(),
};

export const mockSfcDataSpace: SinonStubbedInstance<ISfcDataSpace> = {
  shareAsset: sinon.stub(),
  unshareFootprint: sinon.stub(),
  fetchCarbonFootprint: sinon.stub(),
  startTransferProcess: sinon.stub(),
  fetchSharedFootprintsMetaData: sinon.stub(),
  getAssetIdFromTransferProcess: sinon.stub(),
  fetchReceivedAssets: sinon.stub(),
};

export const sfcConnectionStub = () => {
  const mockSfcAPI: SinonStubbedInstance<ISFCAPI> = {
    createConnection: sinon.stub(),
  };

  const mockSFCAPIConnection: SinonStubbedInstance<ISFCAPIConnection> = {
    getCompanies: sinon.stub(),
    getCompany: sinon.stub(),
    getMyProfile: sinon.stub(),
  };

  mockSfcAPI.createConnection.returns(mockSFCAPIConnection);
  return { mockSfcAPI, mockSFCAPIConnection };
};
