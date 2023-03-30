import KoaRouter from '@koa/router';
import { AuthController } from 'core/controllers/auth';
import { SFCUnitController } from 'core/controllers';

export const sfcUnitRouter = new KoaRouter().get(
  'Share a PCF',
  '/companies',
  AuthController.sfcUnitAuthMiddleware,
  SFCUnitController.companies
);
