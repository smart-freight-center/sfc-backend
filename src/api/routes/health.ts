import KoaRouter from '@koa/router';

export const healthRoutes = new KoaRouter().get(
  'Check if the backend is healthy',
  '/health',
  async (context) => {
    try {
      context.body = { status: 'ok' };
    } catch (error) {
      context.status = 500;
      context.body = { error: 'API server is not healthy' };
    }
  }
);
