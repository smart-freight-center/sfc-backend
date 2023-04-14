import KoaRouter from '@koa/router';
import { AuthController } from 'participants/controllers/auth';
import {
  ConsumeFootPrintController,
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
    ConsumeFootPrintController.requestFootprintsCatalog
  )
  .post(
    'start contract negotitation for a shipemnt',
    '/:shipmentId/negotiate',
    AuthController.authMiddleware,
    ConsumeFootPrintController.startContractNegotiation
  )
  .post(
    'initiate file transfer on the connector',
    '/:shipmentId/request',
    AuthController.authMiddleware,
    ConsumeFootPrintController.initiateFileTransfer
  )
  .get(
    'get data',
    '/:shipmentId/data',
    AuthController.authMiddleware,
    ConsumeFootPrintController.getData
  );

export const pactCompliantRouter = new KoaRouter().get(
  'Get Footprint data',
  '/footprints/:shipmentId',
  AuthController.authMiddleware,
  ConsumeFootPrintController.getData
);
