import KoaRouter from '@koa/router';
import { ReceiverController } from 'api/controllers';

export const receiverRoutes = new KoaRouter({ prefix: '/receiver' }).post(
  'Receiver endpoint callback',
  '/:connectorId/callback',
  ReceiverController.receive
);
