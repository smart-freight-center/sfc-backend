import { RouterContext } from '@koa/router';
import { authTokenCallbackUsecase } from 'core/usecases';
import { TransferCallbackInput } from 'core/usecases/interfaces';

export class ReceiverController {
  static async receive(context: RouterContext) {
    await authTokenCallbackUsecase.execute(
      context.request.body as TransferCallbackInput
    );
    context.status = 204;
  }
}
