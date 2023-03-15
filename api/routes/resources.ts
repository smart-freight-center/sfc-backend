import KoaRouter from '@koa/router';
import koaBodyparser from 'koa-bodyparser';
import { DataAddressInput } from '../../src/core';
import { ApiRouterContext } from '../context';

export const dataAddressesRouter = new KoaRouter()
  .get(
    'get data addresses',
    '/data-address',
    async (context: ApiRouterContext) => {
      const { edcManager, edcManagerContext } = context.state;

      context.body = await edcManager.management.listDataAddresses(
        edcManagerContext
      );
    }
  )
  .post(
    'Add a new DataAddress',
    '/data-address',
    koaBodyparser({
      enableTypes: ['json'],
    }),
    async (context: ApiRouterContext) => {
      const { edcManager, edcManagerContext } = context.state;
      const input = context.request.body as DataAddressInput;
      context.body = await edcManager.management.addDataAddress(
        edcManagerContext,
        input
      );

      context.status = 201;
    }
  );
