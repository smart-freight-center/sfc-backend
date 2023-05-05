import { RouterContext } from '@koa/router';
import {
  ContractNotFound,
  InvalidInput,
  InvalidTokenInSFCAPI,
  ParticipantNotFound,
  TransferNotInitiated,
} from 'utils/error';
import {
  consumeFootprintUsecase,
  getFileUsecase,
  initiateFileTransferUsecase,
} from '../usecases';

export class ConsumeFootprintController {
  static async requestFootprintsCatalog(context: RouterContext) {
    try {
      const args = {
        companyId: context.query.companyId as string,
        shipmentId: context.query.shipmentId as string,
      };

      const catalogs = await consumeFootprintUsecase.execute(
        context.headers.authorization as string,
        args
      );
      context.body = catalogs;
      context.status = 200;
    } catch (error) {
      console.log(error);
      if (error instanceof InvalidInput) {
        context.status = 400;
        context.body = { errors: error.errors };
        return;
      }
      if (error instanceof ParticipantNotFound) {
        context.status = 404;
        context.body = { error: 'Participant not found' };
        return;
      }

      if (error instanceof InvalidTokenInSFCAPI) {
        context.status = 501;
        context.body = {
          error: 'Please share your public key with the SFC Admin.',
        };
        return;
      }

      context.status = 500;
    }
  }

  static async initiateFileTransfer(context: RouterContext) {
    try {
      const { shipmentId } = context.params;
      const { contractNegotiationId, companyId } = context.query;
      const inputData = {
        shipmentId: shipmentId as string,
        contractNegotiationId: contractNegotiationId as string,
        companyId: companyId as string,
      };
      const data = await initiateFileTransferUsecase.execute(
        inputData,
        context.headers.authorization || ''
      );

      context.body = data;
      context.status = 201;
      return;
    } catch (error) {
      if (error instanceof InvalidInput) {
        context.body = { errors: error.errors };
        context.status = 400;
      } else if (error instanceof ParticipantNotFound) {
        context.body = { error: 'invalid client id' };
        context.status = 404;
      } else if (error instanceof ContractNotFound) {
        context.body = { error: 'invalid shipmentId' };
        context.status = 404;
      } else if (error instanceof InvalidTokenInSFCAPI) {
        context.status = 501;
        context.body = {
          error: 'Please share your public key with the SFC Admin.',
        };
      } else {
        context.status = 500;
      }
    }
  }

  static async getData(context: RouterContext) {
    try {
      const shipmentId = context.params.shipmentId as string;
      const data = await getFileUsecase.pullData(shipmentId);
      context.body = data;
      context.status = 200;
    } catch (error) {
      console.log(error);
      if (error instanceof TransferNotInitiated) {
        context.status = 409;
        context.body = {
          error: 'Transfer for this shipment is not yet initiated',
        };
        return;
      }
      context.status = 500;
    }
  }
}
