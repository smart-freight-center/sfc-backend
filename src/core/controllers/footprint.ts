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
      if (response) {
        context.body = response.body;
        context.status = 201;
      } else {
        context.body = 'an error occurred while processing your request';
        context.status = 400;
      }
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
