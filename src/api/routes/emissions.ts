import KoaRouter from '@koa/router';
import {
  ConsumeFootPrintController,
  ProvideFootPrintController,
} from '../../core/controllers';

export const edcRouter = new KoaRouter()
  .post('Share a PCF', '/emissions', ProvideFootPrintController.shareFootprints)
  .get(
    'Get shared PCFs',
    '/emissions/sent',
    ProvideFootPrintController.getSharedFootprints
  )
  .post(
    'Request a data catalog from a connector',
    '/catalog',
    ConsumeFootPrintController.requestFootprintsCatalog
  )
  .post(
    'Request a data catalog from a connector with shipment filter',
    '/catalog/:shipmentId',
    ConsumeFootPrintController.requestFilteredFootprintsCatalog
  );
