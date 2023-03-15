import { RouterContext } from '@koa/router';
import { EdcManager, EdcManagerContext } from '../src/core';

export type ApiRouterContext = RouterContext<{
  edcManager: EdcManager;
  edcManagerContext: EdcManagerContext;
}>;
