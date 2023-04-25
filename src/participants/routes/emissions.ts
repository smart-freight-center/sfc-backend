import KoaRouter from '@koa/router';
import { AuthController } from 'participants/controllers/auth';
import {
  ConsumeFootprintController,
  ProvideFootPrintController,
} from '../controllers';

export const edcRouter = new KoaRouter({ prefix: '/emissions' })
  .post(
    'Share a PCF',
    '/',
    AuthController.authMiddleware,
    ProvideFootPrintController.shareFootprints
  )
  .get(
    'Get shared PCFs',
    '/sent',
    AuthController.authMiddleware,
    ProvideFootPrintController.getSharedFootprints
  )
  .get(
    'Request a data catalog from a connector',
    '/catalog',
    AuthController.authMiddleware,
    ConsumeFootprintController.requestFootprintsCatalog
  )
  .post(
    'initiate file transfer on the connector',
    '/:shipmentId/request',
    AuthController.authMiddleware,
    ConsumeFootprintController.initiateFileTransfer
  );

export const pactCompliantRouter = new KoaRouter().get(
  'Get Footprint data',
  '/footprints/:shipmentId',
  AuthController.authMiddleware,
  ConsumeFootprintController.getData
);
