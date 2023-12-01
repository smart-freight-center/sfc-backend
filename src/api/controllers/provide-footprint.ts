import { ShareFootprintInput } from 'entities';
import {
  deleteFootprintUsecase,
  provideFootprintUsecase,
  retrieveMetricsUsecase,
  runValidationOnRawFileUsecase,
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

  static async validateDataModalOnDataSource(context: RouterContext) {
    const resData = await validateDataModelUsecase.execute(
      context.request.body as ShareFootprintInput
    );

    context.status = 200;
    context.body = {
      message: 'Successfully validated data model',
      meta: resData,
    };
  }

  static async retrieveMetrics(context: RouterContext) {
    const resData = await retrieveMetricsUsecase.execute(
      context.headers.authorization as string
    );

    context.status = 200;
    context.body = {
      data: resData,
    };
  }

  static async validateDataModelFile(context: RouterContext) {
    const request = context.request as any;
    let rawData = '';
    const file = request.files?.rawData?.[0];
    if (file) {
      rawData = file.buffer.toString();
    }

    const metaData = await runValidationOnRawFileUsecase.execute({
      month: request.body.month,
      year: request.body.year,
      rawData,
    });

    context.status = 200;
    context.body = { message: 'The file is valid', meta: metaData };
  }
}
