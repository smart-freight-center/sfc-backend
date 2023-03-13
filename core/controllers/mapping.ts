import {
  EdcConnectorClientError,
  EdcConnectorClientErrorType,
} from "@think-it-labs/edc-connector-client";
import { EdcManagerContext } from "../context";
import {
  Asset,
  AssetInput,
  ContractDefinition,
  ContractDefinitionInput,
  HealthStatus,
  PolicyDefinitionInput,
} from "../entities";
import { EdcManagerError, EdcManagerErrorType } from "../error";
import { Inner } from "../inner";

export class Mapping {
  readonly #inner: Inner;

  constructor(inner: Inner) {
    this.#inner = inner;
  }

  async health(context: EdcManagerContext): Promise<HealthStatus> {
    context.authenticated();

    const connector = context.myConnector;
    const clientContext = this.#inner.edcConnectorClient.createContext(
      "temporary token",
      connector.addresses
    );
    const response =
      await this.#inner.edcConnectorClient.observability.checkHealth(
        clientContext
      );

    return response;
  }

  async createConnectorAsset(
    context: EdcManagerContext,
    input: AssetInput
  ): Promise<void> {
    context.authenticated();

    const connector = context.myConnector;

    const clientContext = this.#inner.edcConnectorClient.createContext(
      "temporary token",
      connector.addresses
    );

    try {
      await this.#inner.edcConnectorClient.management.createAsset(
        clientContext,
        input
      );
    } catch (error) {
      if (error instanceof EdcConnectorClientError) {
        switch (error.type) {
          case EdcConnectorClientErrorType.Duplicate: {
            throw new EdcManagerError(
              EdcManagerErrorType.Duplicate,
              `duplicated asset with id ${input.asset.properties["asset:prop:id"]} in connector with id ${connector.id}`,
              { cause: error as Error }
            );
          }
        }
      }

      throw new EdcManagerError(
        EdcManagerErrorType.Unknown,
        `cannot create an asset`,
        { cause: error as Error }
      );
    }
  }

  async createConnectorContractDefinition(
    context: EdcManagerContext,
    input: ContractDefinitionInput
  ): Promise<void> {
    context.authenticated();

    const connector = context.myConnector;

    const clientContext = this.#inner.edcConnectorClient.createContext(
      "temporary token",
      connector.addresses
    );

    try {
      await this.#inner.edcConnectorClient.management.createContractDefinition(
        clientContext,
        input
      );
    } catch (error) {
      if (error instanceof EdcConnectorClientError) {
        switch (error.type) {
          case EdcConnectorClientErrorType.Duplicate: {
            throw new EdcManagerError(
              EdcManagerErrorType.Duplicate,
              `duplicated contract definition with id ${input.id} in connector with id ${connector.id}`,
              { cause: error }
            );
          }
        }
      }

      throw new EdcManagerError(
        EdcManagerErrorType.Unknown,
        `cannot create an asset`,
        { cause: error as Error }
      );
    }
  }

  async createConnectorPolicy(
    context: EdcManagerContext,
    input: PolicyDefinitionInput
  ): Promise<void> {
    context.authenticated();

    const connector = context.myConnector;

    const clientContext = this.#inner.edcConnectorClient.createContext(
      "temporary token",
      connector.addresses
    );

    try {
      await this.#inner.edcConnectorClient.management.createPolicy(
        clientContext,
        input
      );
    } catch (error) {
      if (error instanceof EdcConnectorClientError) {
        switch (error.type) {
          case EdcConnectorClientErrorType.Duplicate: {
            throw new EdcManagerError(
              EdcManagerErrorType.Duplicate,
              `duplicated policy in connector with id ${connector.id}`,
              { cause: error }
            );
          }
        }
      }

      throw new EdcManagerError(
        EdcManagerErrorType.Unknown,
        `cannot create a policy`,
        { cause: error as Error }
      );
    }
  }

  async listConnectorAssets(context: EdcManagerContext): Promise<Asset[]> {
    context.authenticated();

    const connector = context.myConnector;
    const clientContext = this.#inner.edcConnectorClient.createContext(
      "123456",
      connector.addresses
    );
    const response = await this.#inner.edcConnectorClient.management.listAssets(
      clientContext
    );
    return response;
  }

  async listConnectorPolicies(context: EdcManagerContext): Promise<any> {
    context.authenticated();

    const connector = context.myConnector;
    const clientContext = this.#inner.edcConnectorClient.createContext(
      "temporary token",
      connector.addresses
    );

    const response =
      this.#inner.edcConnectorClient.management.queryAllPolicies(clientContext);

    return response;
  }

  async listConnectorContractDefinitions(
    context: EdcManagerContext
  ): Promise<ContractDefinition[]> {
    context.authenticated();

    const connector = context.myConnector;

    const clientContext = this.#inner.edcConnectorClient.createContext(
      "temporary token",
      connector.addresses
    );
    const response =
      await this.#inner.edcConnectorClient.management.queryAllContractDefinitions(
        clientContext
      );

    return response;
  }
}
