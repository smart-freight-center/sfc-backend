import { RouterContext } from '@koa/router';
import { ShareFootprintInput } from '../../core/entities';
import { InvalidInput } from '../error';
import { shareFootprintUsecase } from '../usecases';

export class FootPrintController {
  static async shareFootprints(context: RouterContext) {
    try {
      const response = await shareFootprintUsecase.share(
        context.request.body as ShareFootprintInput
      );
      context.body = response.body;
      context.status = response.status;
    } catch (error) {
      console.log(error);
      if (error instanceof InvalidInput) {
        context.status = 400;
        return;
      }

      context.status = 500;
    }
  }

  static async getSharedFootprints(context: RouterContext) {
    try {
      const response = await shareFootprintUsecase.list();
      context.body = response.body;
      context.status = response.status;
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
