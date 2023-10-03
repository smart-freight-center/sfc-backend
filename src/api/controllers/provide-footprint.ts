import { ShareFootprintInput } from 'entities';
import { InvalidInput, ContractNotFound } from 'utils/errors';
import {
  deleteFootprintUsecase,
  provideFootprintUsecase,
  shareFootprintUsecase,
} from 'core/usecases';
import { RouterContext } from '@koa/router';
import { EdcConnectorClientError } from '@think-it-labs/edc-connector-client';

export class ProvideFootPrintController {
  static async shareFootprints(context: RouterContext) {
    await shareFootprintUsecase.execute(
      context.headers.authorization as string,
      context.request.body as ShareFootprintInput
    );

    context.status = 201;
    context.body = { message: 'Successfully shared a shipment' };
  }

  static async unshareFootprint(context: RouterContext) {
    const { shipmentId } = context.params;
    const companyId = context.query.companyId as string;

    try {
      const data = await deleteFootprintUsecase.execute(shipmentId, companyId);
      context.status = 200;
      context.body = {
        message: 'access revoked successfully',
        data,
      };
    } catch (error) {
      if (error instanceof ContractNotFound) {
        context.status = 404;
        context.body = {
          error: `No shipment with id ${shipmentId} is currently shared`,
        };
      }
      if (error instanceof InvalidInput) {
        context.status = 400;
        context.body = { errors: error.errors };
        return;
      }
      context.status = 500;
    }
  }

  static async getSharedFootprints(context: RouterContext) {
    try {
      const assets = await provideFootprintUsecase.execute();
      context.body = assets;
      context.status = 200;
    } catch (error) {
      if (error instanceof InvalidInput) {
        context.status = 400;
        context.body = { errors: error.errors };
        return;
      }

      if (error instanceof EdcConnectorClientError) {
        context.status = 503;
        context.body = { error: 'Your connector is not healthy' };
        return;
      }

      context.status = 500;
    }
  }
}
