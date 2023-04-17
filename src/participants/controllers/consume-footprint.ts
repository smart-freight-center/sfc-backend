import { RouterContext } from '@koa/router';
import {
  ContractNotFound,
  InvalidInput,
  ParticipantNotFound,
} from 'utils/error';
import {
  consumeFootprintUsecase,
  getFileUsecase,
  initiateFileTransferUsecase,
  startContractNegotiationUsecase,
} from '../usecases';
import { CatalogRequest } from 'entities';

export class ConsumeFootPrintController {
  static async requestFootprintsCatalog(context: RouterContext) {
    try {
      const args = {
        clientId: context.query.clientId as string,
        shipmentId: context.query.shipmentId as string,
      };
      const catalogs = await consumeFootprintUsecase.listCatalogs(
        context.headers.authorization as string,
        args
      );
      context.body = { data: catalogs };
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

      context.status = 500;
    }
  }
  static async requestFilteredFootprintsCatalog(context: RouterContext) {
    try {
      const { shipmentId } = context.params;
      const data = await consumeFootprintUsecase.listFilteredCatalog(
        context.request.body as CatalogRequest,
        shipmentId
      );
      context.body = data;
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
  static async startContractNegotiation(context: RouterContext) {
    try {
      const data = {
        shipmentId: context.params.shipmentId as string,
        clientId: (context.request.body as any)?.clientId as string,
      };
      const resData = await startContractNegotiationUsecase.execute(
        context.headers.authorization || '',
        data
      );

      context.body = resData;
      context.status = 200;
    } catch (error) {
      console.log(error);
      if (error instanceof InvalidInput) {
        context.status = 400;
        context.body = { errors: error.errors };
        return;
      }
      if (error instanceof ContractNotFound) {
        context.status = 404;
        context.body = { error: 'Invalid shipment Id' };
        return;
      }

      context.status = 500;
    }
  }

  static async initiateFileTransfer(context: RouterContext) {
    try {
      const { shipmentId } = context.params;
      const { contractNegotiationId, clientId } = context.query;
      const inputData = {
        shipmentId: shipmentId as string,
        contractNegotiationId: contractNegotiationId as string,
        clientId: clientId as string,
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
        context.body = { error: 'invalid company id' };
        context.status = 404;
      } else if (error instanceof ContractNotFound) {
        context.body = { error: 'invalid shipmentId' };
        context.status = 404;
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
      context.body = { errors: error };
      context.status = 5000;
    }
  }
}
