import {
  EdcConnectorClient,
  EdcConnectorClientContext,
  PolicyDefinitionInput,
} from '@think-it-labs/edc-connector-client';
import { Connector, AssetInput, ContractDefinitionInput } from '../entities';

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

  async listAssets() {
    return this.edcConnectorClient.management.listAssets(this.edcClientContext);
  }
  async createAsset(input: AssetInput) {
    return this.edcConnectorClient.management.createAsset(
      this.edcClientContext,
      input
    );
  }
  async createPolicy(input: PolicyDefinitionInput) {
    await this.edcConnectorClient.management.createPolicy(
      this.edcClientContext,
      input
    );
  }
  async listPolicy() {
    return this.edcConnectorClient.management.queryAllPolicies(
      this.edcClientContext
    );
  }

  async createContractDefinitions(input : ContractDefinitionInput) {
    return this.edcConnectorClient.management.createContractDefinition(this.edcClientContext, input)

  }
  async listContractDefinitions() {
    return this.edcConnectorClient.management.queryAllContractDefinitions(this.edcClientContext)
  }
}
