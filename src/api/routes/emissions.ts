import KoaRouter from '@koa/router';
import { AuthController } from 'core/controllers/auth';
import {
  ConsumeFootPrintController,
  ProvideFootPrintController,
} from '../../core/controllers';

export const edcRouter = new KoaRouter({ prefix: '/emissioms' })
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
  .post(
    'Request a data catalog from a connector',
    '/catalog',
    AuthController.authMiddleware,
    ConsumeFootPrintController.requestFootprintsCatalog
  )
  .post(
    'Request a data catalog from a connector with shipment filter',
    '/catalog/:shipmentId',
    AuthController.authMiddleware,
    ConsumeFootPrintController.requestFilteredFootprintsCatalog
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
  );
