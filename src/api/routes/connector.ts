import KoaRouter from "@koa/router";
import koaBodyparser from "koa-bodyparser";
import {
  AssetInput,
  ContractDefinitionInput,
  PolicyDefinitionInput,
} from "../../core";
import { ApiRouterContext } from "../context";

export const edcRouter = new KoaRouter({ prefix: "/connector" })
  .get(
    "Get Assets for a target Connector",
    "/asset",
    async (context: ApiRouterContext) => {
      const { edcManager, edcManagerContext } = context.state;
      context.body = await edcManager.mapping.listConnectorAssets(
        edcManagerContext
      );
    }
  )
  .post(
    "Create a new Asset for a target Connector",
    "/asset",
    koaBodyparser({
      enableTypes: ["json"],
    }),
    async (context: ApiRouterContext) => {
      const { edcManager, edcManagerContext } = context.state;
      context.body = await edcManager.mapping.createConnectorAsset(
        edcManagerContext,
        context.request.body as AssetInput
      );
    }
  )
  .get(
    "List all Policies for a target Connector",
    "/policy",
    async (context: ApiRouterContext) => {
      const { edcManager, edcManagerContext } = context.state;
      context.body = await edcManager.mapping.listConnectorPolicies(
        edcManagerContext
      );
    }
  )
  .post(
    "Create a new Policy for a target Connector",
    "/policy",
    koaBodyparser({
      enableTypes: ["json"],
    }),
    async (context: ApiRouterContext) => {
      const { edcManager, edcManagerContext } = context.state;
      context.body = await edcManager.mapping.createConnectorPolicy(
        edcManagerContext,
        context.request.body as PolicyDefinitionInput
      );
    }
  )
  .get(
    "List all Contract definitions for a target Connector",
    "/contract-definition",
    async (context: ApiRouterContext) => {
      const { edcManager, edcManagerContext } = context.state;
      context.body = await edcManager.mapping.listConnectorContractDefinitions(
        edcManagerContext
      );
    }
  )
  .post(
    "Create a new Contract definition for a target Connector",
    "/contract-definition",
    koaBodyparser({
      enableTypes: ["json"],
    }),
    async (context: ApiRouterContext) => {
      const { edcManager, edcManagerContext } = context.state;
      context.body = await edcManager.mapping.createConnectorContractDefinition(
        edcManagerContext,
        context.request.body as ContractDefinitionInput
      );
    }
  );
