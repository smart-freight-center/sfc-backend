import KoaRouter from '@koa/router';
import { AuthController } from 'api/controllers/auth';
import { ConsumerController, ProviderController } from '../controllers';

export const emissionRoutes = new KoaRouter({ prefix: '/emissions' })
  .post(
    'Share a PCF',
    '/',
    AuthController.authMiddleware,
    ProviderController.shareFootprints
  )
  .get(
    'Get shared PCFs',
    '/sent',
    AuthController.authMiddleware,
    ProviderController.getSharedFootprints
  )
  .delete(
    'Revoke access to a shipment',
    '/sent',
    ProviderController.unshareFootprint
  )

  .get(
    'Request a data catalog from a connector',
    '/catalog',
    AuthController.authMiddleware,
    ConsumerController.requestFootprintsCatalog
  )
  .post(
    'initiate file transfer on the connector',
    '/initiate-transfer-by-month',
    AuthController.authMiddleware,
    ConsumerController.initiateTransferByMonth
  )

  .get(
    'Get Footprint data by shipment',
    '/:shipmentId',
    AuthController.authMiddleware,
    ConsumerController.getData
  )

  .post(
    'Validate data model',
    '/validate',
    AuthController.authMiddleware,
    ProviderController.validateDataModel
  );
