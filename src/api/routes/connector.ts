import KoaRouter from '@koa/router';
import { FootPrintController } from '../../core/controllers';

// export const edcRouter = new KoaRouter({ prefix: '/' })
//   .post(
//     'Create a new Policy for a target Connector',
//     '/footprints/:id',
//     FootPrintController.shareFootprints
//   )
//   // .get('smth', '/test', FootPrintController.shareFootprints)
//   .get('Docs', '/xyz', async (context) => {
//     try {
//       context.body = { status: 'ok' };
//     } catch (error) {
//       context.status = 500;
//       context.body = { error: 'API server is not healthy' };
//     }
//   });

export const edcRouter = new KoaRouter().get(
  'Check if the backend is healthy',
  '/footprints',
  FootPrintController.shareFootprints
  // async (context) => {
  //   try {
  //     context.body = { status: 'ok' };
  //   } catch (error) {
  //     context.status = 500;
  //     context.body = { error: 'API server is not healthy' };
  //   }
  // }
);
