import sinon, { SinonStubbedInstance } from 'sinon';
import { IEdcClient } from '../interfaces';

export const mockEdcClient: SinonStubbedInstance<IEdcClient> = {
  deleteAsset: sinon.stub(),
  listAssets: sinon.stub(),
  createPolicy: sinon.stub(),
  createAsset: sinon.stub(),
  deletePolicy: sinon.stub(),
  listPolicy: sinon.stub(),
  createContractDefinitions: sinon.stub(),

  deleteContractDefinition: sinon.stub(),
  queryAllContractDefinitions: sinon.stub(),
  listCatalog: sinon.stub(),
  queryAllPolicies: sinon.stub(),
  starContracttNegotiation: sinon.stub(),

  getContractNegotiationResponse: sinon.stub(),

  getTranferedData: sinon.stub(),
  getAgreementForNegotiation: sinon.stub(),
  queryAllAgreements: sinon.stub(),
  getNegotiationState: sinon.stub(),
  initiateTransfer: sinon.stub(),
};
