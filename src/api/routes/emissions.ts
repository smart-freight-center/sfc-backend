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
    '/:shipmentId/request',
    AuthController.authMiddleware,
    ConsumerController.initiateFileTransfer
  )

  .post(
    'initiate file transfer on the connector',
    '/inititate-batch-transfer',
    AuthController.authMiddleware,
    ConsumerController.initiateBatchTransfer
  )

  .get(
    'Get Footprint data by shipment',
    '/:shipmentId',
    AuthController.authMiddleware,
    ConsumerController.getData
  );
