import type { EdcManager } from "./edc-manager";
import { Connector } from "./entities";

export interface EdcManagerContextInner {
  compare(edcManager: EdcManager): boolean;
  assert(): boolean;
}

export class EdcManagerContext {
  readonly inner: EdcManagerContextInner;
  readonly myConnector: Connector;
  constructor(inner: EdcManagerContextInner, connector: Connector) {
    this.inner = inner;
    this.myConnector = connector;
  }

  authenticated(): boolean {
    return true;
  }
}
