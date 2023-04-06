import {
  AssetInput,
  CatalogRequest,
  ContractDefinitionInput,
  ContractNegotiationRequest,
  EdcConnectorClient,
  EdcConnectorClientContext,
  PolicyDefinitionInput,
  TransferProcessInput,
} from '@think-it-labs/edc-connector-client';
import { Connector } from 'entities';

export class EdcAdapter {
  readonly edcConnectorClient: EdcConnectorClient;
  edcClientContext: EdcConnectorClientContext;

  constructor(myConnector: Connector, token: string) {
    this.edcConnectorClient = new EdcConnectorClient();

    const clientContext = this.edcConnectorClient.createContext(
      token,
      myConnector.addresses
    );

    this.edcClientContext = clientContext;
  }

  async createAsset(input: AssetInput) {
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
}
