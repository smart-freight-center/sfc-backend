import { RouterContext } from '@koa/router';
import { ShareFootprintInput } from 'entities';
import { InvalidInput } from 'utils/error';
import { provideFootprintUsecase } from 'participants/usecases';

export class ProvideFootPrintController {
  static async shareFootprints(context: RouterContext) {
    try {
      const response = await provideFootprintUsecase.share(
        context.request.body as ShareFootprintInput
      );
      if (response) {
        context.status = 201;
        context.body = response.body;
        return;
      } else {
        context.body = 'an error occurred while processing your request';
        context.status = 400;
      }
      return;
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
      if (error instanceof InvalidInput) {
        context.status = 400;
        return;
      }

      context.status = 500;
    }
  }
}
