import KoaRouter from '@koa/router';
import { AuthController } from 'participants/controllers/auth';

export const authRouter = new KoaRouter({ prefix: '/auth' }).post(
  'Generate Token',
  '/token',
  AuthController.generateToken
);
