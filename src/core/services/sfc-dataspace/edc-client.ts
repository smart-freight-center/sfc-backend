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
} from '@think-it-labs/edc-connector-client';
import { Connector, ContractNegotiationState } from 'entities';
import { IEdcClient } from './interfaces';

export class EdcClient implements IEdcClient {
  readonly edcConnectorClient: EdcConnectorClient;
  edcClientContext: EdcConnectorClientContext;
  edcClientId: string;
  constructor(myConnector: Connector, token: string) {
    const builder = new EdcConnectorClient.Builder();

    builder.managementUrl(myConnector.addresses.management as string);
    builder.publicUrl(myConnector.addresses.public as string);
    builder.apiToken(token);
    this.edcConnectorClient = builder.build();
    this.edcClientId = myConnector.id;
  }

  async createAsset(input: AssetInput) {
    return this.edcConnectorClient.management.assets.create(input);
  }
  async deleteAsset(assetId: string) {
    return this.edcConnectorClient.management.assets.delete(assetId);
  }
  async listAssets(query?: QuerySpec) {
    return this.edcConnectorClient.management.assets.queryAll(query);
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
    return this.edcConnectorClient.management.contractNegotiations.initiate(
      input
    );
  }
  async getContractNegotiationResponse(contracNegotiationId: string) {
    return this.edcConnectorClient.management.contractNegotiations.get(
      contracNegotiationId
    );
  }
  async initiateTransfer(input: TransferProcessInput) {
    return this.edcConnectorClient.management.transferProcesses.initiate(input);
  }
  async getTranferedData(authKey: string, authCode: string) {
    return this.edcConnectorClient.public.getTransferredData({
      [authKey]: authCode,
    });
  }

  async getTransferProcessById(transferProcessId: string) {
    const transferProcesses =
      await this.edcConnectorClient.management.transferProcesses.queryAll({
        filterExpression: [
          { operandLeft: 'id', operator: '=', operandRight: transferProcessId },
        ],
      });

    return transferProcesses[0];
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
    const negotiation =
      await this.edcConnectorClient.management.contractNegotiations.getState(
        input
      );

    return negotiation.state as ContractNegotiationState;
  }
}
