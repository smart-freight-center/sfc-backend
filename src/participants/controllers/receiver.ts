import { RouterContext } from '@koa/router';
import { getTransferProcessUsecase } from 'participants/usecases';

export class ReceiverController {
  static async receive(context: RouterContext) {
    try {
      await getTransferProcessUsecase.execute(context.request.body);
      context.status = 204;
    } catch (error) {
      context.body = { errors: error };
      context.status = 400;
    }
  }
}
