import { ShareFootprintInput } from 'entities';
import { InvalidInput } from 'utils/errors';
import {
  deleteFootprintUsecase,
  provideFootprintUsecase,
  shareFootprintUsecase,
  validateDataModelUsecase,
} from 'core/usecases';
import { RouterContext } from '@koa/router';
import { EdcConnectorClientError } from '@think-it-labs/edc-connector-client';
import { DeleteFootprintInput } from 'core/usecases/delete-fooprint';

export class ProviderController {
  static async shareFootprints(context: RouterContext) {
    await shareFootprintUsecase.execute(
      context.headers.authorization as string,
      context.request.body as ShareFootprintInput
    );

    context.status = 201;
    context.body = { message: 'Successfully shared a shipment' };
  }

  static async unshareFootprint(context: RouterContext) {
    const authorization = context.headers.authorization as string;
    const data = await deleteFootprintUsecase.execute(
      authorization,
      context.request.body as DeleteFootprintInput
    );
    context.status = 200;
    context.body = {
      message: 'We have successfully revoked access for that asset',
      data,
    };
  }

  static async getSharedFootprints(context: RouterContext) {
    try {
      const assets = await provideFootprintUsecase.execute(
        context.headers.authorization as string
      );
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
  static async validateDataModel(context: RouterContext) {
    await validateDataModelUsecase.execute(
      // context.headers.authorization as string,
      context.request.body as ShareFootprintInput
    );

    context.status = 200;
    context.body = { message: 'Successfully validated data model' };
  }
}
