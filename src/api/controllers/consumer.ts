import { RouterContext } from '@koa/router';
import {
  retrieveFootprintsUsecase,
  getEmissionsUsecase,
  initiateBatchRequestUsecase,
  initiateFileTransferUsecase,
} from 'core/usecases';

export class ConsumerController {
  static async requestFootprintsCatalog(context: RouterContext) {
    const args = {
      companyId: context.query.companyId as string,
      shipmentId: context.query.shipmentId as string,
    };

    const catalogs = await retrieveFootprintsUsecase.execute(
      context.headers.authorization as string,
      args
    );
    context.body = catalogs;
    context.status = 200;
  }

  static async initiateFileTransfer(context: RouterContext) {
    const authorization = context.headers.authorization || '';
    const { shipmentId } = context.params;
    const inputData = {
      shipmentId: shipmentId,
    };
    const jobId = await initiateFileTransferUsecase.execute(
      inputData,
      authorization
    );

    context.body = { jobId };
    context.status = 201;
  }

  static async initiateBatchTransfer(context: RouterContext) {
    const authorization = context.headers.authorization || '';

    const jobId = await initiateBatchRequestUsecase.execute(
      context.request.body as any,
      authorization
    );

    context.body = { jobId };
    context.status = 201;
  }

  static async getData(context: RouterContext) {
    const shipmentId = context.params.shipmentId as string;
    const aggregate = context.query.aggregate || 'false';
    const data = await getEmissionsUsecase.execute(
      shipmentId,
      aggregate == 'true'
    );
    context.body = data;
    context.status = 200;
  }
}
