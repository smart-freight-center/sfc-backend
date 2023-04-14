import { ShareFootprintInput } from 'entities';
import { InvalidInput } from 'utils/error';
import { provideFootprintUsecase } from 'participants/usecases';
import { RouterContext } from '@koa/router';

export class ProvideFootPrintController {
  static async shareFootprints(context: RouterContext) {
    try {
      const data = await provideFootprintUsecase.share(
        context.request.body as ShareFootprintInput
      );
      if (data) {
        context.status = 201;
        context.body = data;
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
      const assets = await provideFootprintUsecase.list();
      context.body = assets;
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
