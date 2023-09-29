import { RouterContext } from '@koa/router';
import { authTokenCallbackUsecase } from 'core/usecases';

export class ReceiverController {
  static async receive(context: RouterContext) {
    try {
      await authTokenCallbackUsecase.execute(context.request.body);
      context.status = 204;
    } catch (error) {
      context.body = { errors: error };
      context.status = 400;
    }
  }
}
