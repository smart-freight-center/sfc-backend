import { RouterContext } from '@koa/router';
import { InvalidInput } from '../error';
import { shareFootprintUsecase } from '../usecases';

export class FootPrintController {
  static async shareFootprints(context: RouterContext) {
    try {
      const data = await shareFootprintUsecase.execute({
        shipmentId: context.params.id,
      });
      context.body = data;
      context.status = 200;
    } catch (error) {
      console.log(error);
      if (error instanceof InvalidInput) {
        context.status = 400;
        return;
      }

      context.status = 500;
    }
  }
}
