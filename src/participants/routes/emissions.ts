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
  .delete(
    'Revoke access to a shipment',
    '/sent/:shipmentId',
    ProvideFootPrintController.unshareFootprint
  )

  .get(
    'Request a data catalog from a connector',
    '/catalog',
    AuthController.authMiddleware,
    ConsumeFootPrintController.requestFootprintsCatalog
  )
  .post(
    'initiate file transfer on the connector',
    '/:shipmentId/request',
    AuthController.authMiddleware,
    ConsumeFootPrintController.initiateFileTransfer
  )

  .post(
    'initiate file transfer on the connector',
    '/inititate-batch-transfer',
    AuthController.authMiddleware,
    ConsumeFootPrintController.initiateBatchTransfer
  )

  .get(
    'Get Footprint data by shipment',
    '/:shipmentId',
    AuthController.authMiddleware,
    ConsumeFootPrintController.getData
  );
