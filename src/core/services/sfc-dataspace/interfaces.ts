import {
  AssetInput,
  Catalog,
  CatalogRequest,
  ContractAgreement,
  ContractDefinition,
  ContractDefinitionInput,
  ContractNegotiation,
  ContractNegotiationRequest,
  ContractNegotiationState,
  CreateResult,
  PolicyDefinition,
  PolicyDefinitionInput,
  QuerySpec,
  TransferProcessInput,
  TransferProcessResponse,
} from '@think-it-labs/edc-connector-client';

export interface IEdcClient {
  deleteAsset: (assetId: string) => Promise<void>;
  listAssets: () => Promise<unknown>;
  createPolicy: (input: PolicyDefinitionInput) => Promise<CreateResult>;
  createAsset: (input: AssetInput) => Promise<CreateResult>;
  deletePolicy: (policyId: string) => Promise<void>;
  listPolicy: () => Promise<PolicyDefinition[]>;
  createContractDefinitions: (
    input: ContractDefinitionInput
  ) => Promise<CreateResult>;

  deleteContractDefinition: (contractDefinitionId: string) => Promise<void>;
  queryAllContractDefinitions: (
    query?: QuerySpec
  ) => Promise<ContractDefinition[]>;
  listCatalog: (input: CatalogRequest) => Promise<Catalog>;
  queryAllPolicies: (input) => Promise<PolicyDefinition[]>;
  starContracttNegotiation: (
    input: ContractNegotiationRequest
  ) => Promise<CreateResult>;

  getContractNegotiationResponse: (
    contracNegotiationId: string
  ) => Promise<ContractNegotiation>;

  getTranferedData: (input: TransferProcessResponse) => Promise<Response>;
  getAgreementForNegotiation: (
    negotiationId: string
  ) => Promise<ContractAgreement>;
  queryAllAgreements: (query?: QuerySpec) => Promise<ContractAgreement[]>;
  getNegotiationState: (input: string) => Promise<ContractNegotiationState>;
  initiateTransfer: (input: TransferProcessInput) => Promise<CreateResult>;
}
