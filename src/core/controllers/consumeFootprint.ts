import { RouterContext } from '@koa/router';
import { CatalogRequest } from 'core/entities';
import { InvalidInput } from 'core/error';
import { consumeFootprintUsecase } from '../usecases';

export class ConsumeFootPrintController {
  static async requestFootprintsCatalogs(context: RouterContext) {
    try {
      const response = await consumeFootprintUsecase.listCatalogs(
        context.request.body as CatalogRequest
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
}
