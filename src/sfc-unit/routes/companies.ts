import KoaRouter from '@koa/router';
import { SFCAuthController } from '../controllers/auth';
import { SFCUnitController } from '../controllers';

export const sfcUnitRouter = new KoaRouter().get(
  'Share a PCF',
  '/companies',
  SFCAuthController.sfcUnitAuthMiddleware,
  SFCUnitController.companies
);
