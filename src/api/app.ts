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

app.use(healthRoutes.routes());
app.use(authRoutes.routes());
app.use(emissionRoutes.routes());
app.use(receiverRoutes.routes());

export { app, server };
