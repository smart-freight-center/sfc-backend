import { EdcManagerContext } from "./context";
import { Management, Mapping } from "./controllers";
import { Inner } from "./inner";
import { Connector } from "./entities";

const DISPOSED = Symbol("[_disposed]");

export interface Logger {
  trace(message: string): void;
  warn(message: string): void;
}

export interface EdcManagerConfig {
  connectorRegistry: Connector[];
}

export class EdcManager {
  readonly management: Management;
  readonly mapping: Mapping;

  [DISPOSED] = false;

  constructor(config: EdcManagerConfig) {
    const inner = new Inner(config.connectorRegistry);

    this.management = new Management();
    this.mapping = new Mapping(inner);
  }

  createContext() {
    const self = this;
    const connector: Connector = JSON.parse(
      process.env.CONNECTOR_CONFIG as string
    ) ?? {
      id: "urn:connector:consumer",
      title: "consumer.edc.think-it.io",
      catalogId: "default",
      description: "The consumer connector for the EDC manager demo",
      region: "eu-west-1",
      addresses: {
        default: "http://localhost:19191/api",
        validation: "http://localhost:19292",
        management: "http://localhost:19193/api/v1/data",
        protocol: "http://consumer-connector:9194/api/v1/ids",
        dataplane: "http://localhost:19195",
        public: "http://localhost:19291/public",
        control: "http://localhost:19292/control",
      },
    };

    return new EdcManagerContext(
      {
        compare(edcManager: EdcManager): boolean {
          return edcManager === self;
        },
        assert(): boolean {
          return !self[DISPOSED];
        },
      },
      connector
    );
  }

  /** Free all open connections. After use, the input instance will not work anymore. */
  static async dispose(edcManager: EdcManager): Promise<void> {
    edcManager[DISPOSED] = true;
  }
}
