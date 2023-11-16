import * as http from 'http';
import cors from '@koa/cors';
import Koa, { Context } from 'koa';
import {
  emissionRoutes,
  authRoutes,
  healthRoutes,
  receiverRoutes,
} from './routes';
import koaBodyparser from 'koa-bodyparser';
import { handleErrors } from 'utils/helpers';
import KoaRouter from '@koa/router';

const app = new Koa();

app.use(cors());

app.use(
  koaBodyparser({
    enableTypes: ['json', 'form'],
  })
);

const server = http.createServer(app.callback());

app.use(async (context: Context, next: () => Promise<void>) => {
  try {
    await next();
  } catch (error) {
    handleErrors(context, error as Error);
  }
});

const baseRouter = new KoaRouter({ prefix: '/api' });
const v1Router = new KoaRouter({ prefix: '/v1' });

v1Router.use(emissionRoutes.routes());
v1Router.use(receiverRoutes.routes());

baseRouter.use(authRoutes.routes());
baseRouter.use(v1Router.routes());

app.use(healthRoutes.routes());
app.use(baseRouter.routes());

export { app, server };
