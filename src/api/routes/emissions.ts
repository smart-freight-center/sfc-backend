import KoaRouter from '@koa/router';
import { AuthController } from 'api/controllers/auth';
import { ConsumerController, ProviderController } from '../controllers';
import multer from '@koa/multer';

const upload = multer();

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
    ProviderController.unshareFootprint
  )

  .post(
    'Validate data model',
    '/validate-data-source',
    AuthController.authMiddleware,
    ProviderController.validateDataModalOnDataSource
  )

  .post(
    'Validate data model',
    '/validate-file',
    upload.fields([{ name: 'rawData', maxCount: 1 }]),
    AuthController.authMiddleware,
    ProviderController.validateDataModelFile
  )

  .get(
    'Request carbon footprints of emissions received',
    '/received',
    AuthController.authMiddleware,
    ConsumerController.fetchReceivedFootprintMeta
  )
  .post(
    'initiate file transfer on the connector',
    '/initiate-transfer-by-month',
    AuthController.authMiddleware,
    ConsumerController.initiateTransferByMonth
  )

  .get(
    'Get Footprint data by shipment',
    '/:jobId',
    AuthController.authMiddleware,
    ConsumerController.getData
  );
