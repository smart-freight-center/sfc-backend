import KoaRouter from '@koa/router';
import { FootPrintController } from '../../core/controllers';

export const edcRouter = new KoaRouter()
  .post('Share a PCF', '/emissions', FootPrintController.shareFootprints)
  .get(
    'Get shared PCFs',
    '/emissions/sent',
    FootPrintController.getSharedFootprints
  );
