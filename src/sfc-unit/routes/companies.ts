import KoaRouter from '@koa/router';
import { SFCAuthController } from '../controllers/auth';
import { SFCUnitController } from '../controllers';

export const sfcUnitRouter = new KoaRouter()
  .get(
    'Companies logged in user can share data me',
    '/companies',
    SFCAuthController.sfcUnitAuthMiddleware,
    SFCUnitController.companies
  )
  .get(
    'Logged in company profile',
    '/companies/me',
    SFCAuthController.sfcUnitAuthMiddleware,
    SFCUnitController.profile
  );
