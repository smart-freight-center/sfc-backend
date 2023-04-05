import KoaRouter from '@koa/router';
import { AuthController } from 'core/controllers/auth';
import {
  ConsumeFootPrintController,
  ProvideFootPrintController,
} from '../../core/controllers';

export const edcRouter = new KoaRouter()
  .post(
    'Share a PCF',
    '/emissions',

    AuthController.authMiddleware,
    ProvideFootPrintController.shareFootprints
  )
  .get(
    'Get shared PCFs',
    '/emissions/sent',
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
    '/emissions/:shipmentId/negotiate',
    AuthController.authMiddleware,
    ConsumeFootPrintController.startContractNegotiation
  );
