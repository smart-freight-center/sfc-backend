import { RouterContext } from '@koa/router';
import { ShareFootprintInput } from '../entities';
import { InvalidInput } from '../error';
import { provideFootprintUsecase } from '../usecases';

export class ProvideFootPrintController {
  static async shareFootprints(context: RouterContext) {
    try {
      const response = await provideFootprintUsecase.share(
        context.request.body as ShareFootprintInput
      );
      context.body = response.body;
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

  static async getSharedFootprints(context: RouterContext) {
    try {
      const response = await provideFootprintUsecase.list();
      context.body = response.body;
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
