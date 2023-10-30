import {
  Asset,
  AssetInput,
  Catalog,
  CatalogRequest,
  ContractAgreement,
  ContractDefinition,
  ContractDefinitionInput,
  ContractNegotiation,
  ContractNegotiationRequest,
  IdResponse,
  PolicyDefinition,
  PolicyDefinitionInput,
  QuerySpec,
  TransferProcessInput,
  TransferProcessResponse,
} from '@think-it-labs/edc-connector-client';
import { ContractNegotiationState } from 'entities';

export interface IEdcClient {
  deleteAsset: (assetId: string) => Promise<void>;
  listAssets: (query?: QuerySpec) => Promise<Asset[]>;
  createPolicy: (input: PolicyDefinitionInput) => Promise<IdResponse>;
  createAsset: (input: AssetInput) => Promise<IdResponse>;
  deletePolicy: (policyId: string) => Promise<void>;
  listPolicy: () => Promise<PolicyDefinition[]>;
  createContractDefinitions: (
    input: ContractDefinitionInput
  ) => Promise<IdResponse>;

  deleteContractDefinition: (contractDefinitionId: string) => Promise<void>;
  queryAllContractDefinitions: (
    query?: QuerySpec
  ) => Promise<ContractDefinition[]>;
  listCatalog: (input: CatalogRequest) => Promise<Catalog>;
  queryAllPolicies: (input) => Promise<PolicyDefinition[]>;
  starContracttNegotiation: (
    input: ContractNegotiationRequest
  ) => Promise<IdResponse>;

  getContractNegotiationResponse: (
    contracNegotiationId: string
  ) => Promise<ContractNegotiation>;

  getTranferedData: (input: TransferProcessResponse) => Promise<Response>;
  getAgreementForNegotiation: (
    negotiationId: string
  ) => Promise<ContractAgreement>;
  queryAllAgreements: (query?: QuerySpec) => Promise<ContractAgreement[]>;
  getNegotiationState: (input: string) => Promise<ContractNegotiationState>;
  initiateTransfer: (input: TransferProcessInput) => Promise<IdResponse>;
}
