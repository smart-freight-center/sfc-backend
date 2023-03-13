import { RouterContext } from "@koa/router";
import { EdcManager, EdcManagerContext } from "../core";

export type ApiRouterContext = RouterContext<{
  edcManager: EdcManager;
  edcManagerContext: EdcManagerContext;
}>;
