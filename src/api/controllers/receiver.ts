import { RouterContext } from '@koa/router';
import { authTokenCallbackUsecase } from 'core/usecases';

export class ReceiverController {
  static async receive(context: RouterContext) {
    await authTokenCallbackUsecase.execute(context.request.body);
    context.status = 204;
  }
}
