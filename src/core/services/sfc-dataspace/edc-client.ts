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
import { IEdcClient } from './interfaces';

export class EdcClient implements IEdcClient {
  readonly edcConnectorClient: EdcConnectorClient;
  edcClientContext: EdcConnectorClientContext;
  edcClientId: string;
  constructor(myConnector: Connector, token: string) {
    const builder = new EdcConnectorClient.Builder();

    builder.managementUrl(myConnector.addresses.management as string);
    builder.publicUrl(myConnector.addresses.public as string);
    this.edcConnectorClient = builder.build();
    this.edcClientId = myConnector.id;

    const clientContext = this.edcConnectorClient.createContext(
      token,
      myConnector.addresses
    );

    this.edcClientContext = clientContext;
  }

  async createAsset(input: AssetInput) {
    return this.edcConnectorClient.management.assets.create(
      input,
      this.edcClientContext
    );
  }
  async deleteAsset(assetId: string) {
    return this.edcConnectorClient.management.assets.delete(
      assetId,
      this.edcClientContext
    );
  }
  async listAssets() {
    return this.edcConnectorClient.management.assets.queryAll();
  }

  async createPolicy(input: PolicyDefinitionInput) {
    const policy =
      await this.edcConnectorClient.management.policyDefinitions.create(
        input,
        this.edcClientContext
      );
    return policy;
  }
  async deletePolicy(policyId: string) {
    return this.edcConnectorClient.management.policyDefinitions.delete(
      policyId,
      this.edcClientContext
    );
  }
  async listPolicy() {
    return this.edcConnectorClient.management.policyDefinitions.queryAll();
  }

  async createContractDefinitions(input: ContractDefinitionInput) {
    return this.edcConnectorClient.management.contractDefinitions.create(input);
  }
  async deleteContractDefinition(contractDefinitionId: string) {
    return this.edcConnectorClient.management.contractDefinitions.delete(
      contractDefinitionId
    );
  }
  async queryAllContractDefinitions(query?: QuerySpec) {
    return this.edcConnectorClient.management.contractDefinitions.queryAll(
      query
    );
  }

  async listCatalog(input: CatalogRequest) {
    return this.edcConnectorClient.management.catalog.request(input);
  }
  async queryAllPolicies(input) {
    return this.edcConnectorClient.management.policyDefinitions.queryAll(input);
  }
  async starContracttNegotiation(input: ContractNegotiationRequest) {
    // return this.edcConnectorClient.management.initiateContractNegotiation(
    return this.edcConnectorClient.management.contractNegotiations.initiate(
      input
    );
  }
  async getContractNegotiationResponse(contracNegotiationId: string) {
    return this.edcConnectorClient.management.contractNegotiations.get(
      // return this.edcConnectorClient.management.getNegotiation(
      contracNegotiationId
    );
  }
  async initiateTransfer(input: TransferProcessInput) {
    return this.edcConnectorClient.management.transferProcesses.initiate(input);
  }
  async getTranferedData(input: TransferProcessResponse) {
    return this.edcConnectorClient.public.getTransferredData({
      [input.authKey]: input.authCode,
    });
  }
  async getContractAgreement(input: string) {
    return this.edcConnectorClient.management.contractAgreements.get(input);
  }
  async getAgreementForNegotiation(input: string) {
    return this.edcConnectorClient.management.contractAgreements.get(input);
  }
  async queryAllAgreements(query?: QuerySpec) {
    return this.edcConnectorClient.management.contractAgreements.queryAll(
      query
    );
  }
  async getNegotiationState(input: string) {
    return this.edcConnectorClient.management.contractNegotiations.getState(
      input
    );
  }
}
