import { RouterContext } from '@koa/router';
import { CatalogRequest } from '../entities';
import { InvalidInput } from '../error';
import { consumeFootprintUsecase } from '../usecases';

export class ConsumeFootPrintController {
  static async requestFootprintsCatalog(context: RouterContext) {
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
  static async requestFilteredFootprintsCatalog(context: RouterContext) {
    try {
      const { shipmentId } = context.params;
      const response = await consumeFootprintUsecase.listFilteredCatalog(
        context.request.body as CatalogRequest,
        shipmentId
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
