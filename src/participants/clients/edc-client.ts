import {
  AssetInput,
  CatalogRequest,
  ContractDefinitionInput,
  ContractNegotiationRequest,
  EdcConnectorClient,
  EdcConnectorClientContext,
  PolicyDefinitionInput,
  QuerySpec,
  TransferProcessInput,
  TransferProcessResponse,
} from '@think-it-labs/edc-connector-client';
import { Connector } from 'entities';

export class EdcAdapter {
  readonly edcConnectorClient: EdcConnectorClient;
  edcClientContext: EdcConnectorClientContext;
  edcClientId: string;
  constructor(myConnector: Connector, token: string) {
    this.edcConnectorClient = new EdcConnectorClient();
    this.edcClientId = myConnector.id;
    console.log("using connector with address : ", myConnector.addresses)
    const clientContext = this.edcConnectorClient.createContext(
      token,
      myConnector.addresses
    );

    this.edcClientContext = clientContext;
  }

  async createAsset(input: AssetInput) {
    console.log("--- creating asset with input ---", input)
    try {
      this.edcConnectorClient.management.createAsset(
        this.edcClientContext,
        input
      );
    } catch (error) {
      console.log("Can't create asset")
      console.log(error)
    }
    return this.edcConnectorClient.management.createAsset(
      this.edcClientContext,
      input
    );
  }
  async deleteAsset(assetId: string) {
    return this.edcConnectorClient.management.deleteAsset(
      this.edcClientContext,
      assetId
    );
  }
  async listAssets() {
    return this.edcConnectorClient.management.listAssets(this.edcClientContext);
  }

  async createPolicy(input: PolicyDefinitionInput) {
    const policy = await this.edcConnectorClient.management.createPolicy(
      this.edcClientContext,
      input
    );
    return policy;
  }
  async deletePolicy(policyId: string) {
    return this.edcConnectorClient.management.deletePolicy(
      this.edcClientContext,
      policyId
    );
  }
  async listPolicy() {
    return this.edcConnectorClient.management.queryAllPolicies(
      this.edcClientContext
    );
  }

  async createContractDefinitions(input: ContractDefinitionInput) {
    return this.edcConnectorClient.management.createContractDefinition(
      this.edcClientContext,
      input
    );
  }
  async deleteContractDefinition(contractDefinitionId: string) {
    return this.edcConnectorClient.management.deleteContractDefinition(
      this.edcClientContext,
      contractDefinitionId
    );
  }
  async listContractDefinitions() {
    return this.edcConnectorClient.management.queryAllContractDefinitions(
      this.edcClientContext
    );
  }

  async listCatalog(input: CatalogRequest) {
    return this.edcConnectorClient.management.requestCatalog(
      this.edcClientContext,
      input
    );
  }
  async queryAllPolicies(input) {
    return this.edcConnectorClient.management.queryAllPolicies(
      this.edcClientContext,
      input
    );
  }
  async starContracttNegotiation(input: ContractNegotiationRequest) {
    return this.edcConnectorClient.management.initiateContractNegotiation(
      this.edcClientContext,
      input
    );
  }
  async getContractNegotiationResponse(contracNegotiationId: string) {
    return this.edcConnectorClient.management.getNegotiation(
      this.edcClientContext,
      contracNegotiationId
    );
  }
  async initiateTransfer(input: TransferProcessInput) {
    return this.edcConnectorClient.management.initiateTransfer(
      this.edcClientContext,
      input
    );
  }
  async getTranferedData(input: TransferProcessResponse) {
    return this.edcConnectorClient.public.getTranferedData(
      this.edcClientContext,
      { [input.authKey]: input.authCode }
    );
  }
  async getContractAgreement(input: string) {
    return this.edcConnectorClient.management.getAgreement(
      this.edcClientContext,
      input
    );
  }
  async getAgreementForNegotiation(input: string) {
    return this.edcConnectorClient.management.getAgreementForNegotiation(
      this.edcClientContext,
      input
    );
  }
  async queryAllAgreements(query?: QuerySpec) {
    return this.edcConnectorClient.management.queryAllAgreements(
      this.edcClientContext,
      query
    );
  }
  async getNegotiationState(input: string) {
    return this.edcConnectorClient.management.getNegotiationState(
      this.edcClientContext,
      input
    );
  }
}
