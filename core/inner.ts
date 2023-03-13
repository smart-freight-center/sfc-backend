import { EdcConnectorClient } from "@think-it-labs/edc-connector-client";
import { Connector } from "./entities";
// import { ConnectorRegistry } from "./connector-registry";

export class Inner {
  readonly edcConnectorClient: EdcConnectorClient;
  readonly connectorRegistry: Connector[];

  constructor(registry: Connector[]) {
    this.edcConnectorClient = new EdcConnectorClient();
    this.connectorRegistry = registry;
  }
}
