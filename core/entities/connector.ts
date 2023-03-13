import { Addresses } from "./edc-connector-client";

export interface Connector {
  id: string;
  title?: string;
  description?: string;
  maintainer?: string;
  curator?: string;
  catalogId?: string;
  region: string;
  addresses: Addresses;
}

export interface ConnectorInput {
  id: string;
  title?: string;
  description?: string;
  maintainer?: string;
  curator?: string;
  catalogId: string;
  region: string;
}
