import KoaRouter from '@koa/router';
import { ReceiverController } from 'participants/controllers';

export const receiverRouter = new KoaRouter({ prefix: '/receiver' }).post(
  'Receiver endpoint callback',
  '/:connectorId/callback',
  ReceiverController.receive
);
