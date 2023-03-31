import KoaRouter from '@koa/router';
import { AuthController } from 'core/controllers/auth';

export const authRouter = new KoaRouter({ prefix: '/auth' })
  .post('Generate Token', '/token', AuthController.generateToken)
  .post(
    'Verify Token',
    '/verify-token-example',
    AuthController.authMiddleware,
    (ctx) => {
      ctx.body = { message: 'Got here', decoded: ctx.decoded };
      ctx.status = 200;
    }
  );
