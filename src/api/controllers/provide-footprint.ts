import { ShareFootprintInput } from 'entities';
import {
  deleteFootprintUsecase,
  provideFootprintUsecase,
  shareFootprintUsecase,
  validateDataModelUsecase,
} from 'core/usecases';
import { RouterContext } from '@koa/router';
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
    const responseData = await provideFootprintUsecase.execute(
      context.headers.authorization as string,
      context.query
    );
    context.body = responseData;
    context.status = 200;
  }

  static async validateDataModel(context: RouterContext) {
    await validateDataModelUsecase.execute(
      context.request.body as ShareFootprintInput
    );

    context.status = 200;
    context.body = { message: 'Successfully validated data model' };
  }
}
