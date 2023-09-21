import KoaRouter from '@koa/router';
import { AuthController } from 'api/controllers/auth';

export const authRoutes = new KoaRouter({ prefix: '/auth' }).post(
  'Generate Token',
  '/token',
  AuthController.generateToken
);
