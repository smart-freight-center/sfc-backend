import { RouterContext } from '@koa/router';
import { getFileUsecase } from 'participants/usecases';

export class ReceiverController {
  static async receive(context: RouterContext) {
    try {
      await getFileUsecase.getTransferProcessResponse(context.request.body);
      context.status = 204;
    } catch (error) {
      context.body = { errors: error };
      context.status = 400;
    }
  }
}