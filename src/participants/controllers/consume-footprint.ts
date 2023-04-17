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
} from '../usecases';
import { CatalogRequest } from 'entities';

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
  static async startContractNegotiation(context: RouterContext) {
    try {
      const { shipmentId } = context.params;
      const catalogRequest = context.request.body as CatalogRequest;
      const contractOfferResponse =
        await consumeFootprintUsecase.listFilteredCatalog(
          catalogRequest,
          shipmentId
        );
      if (contractOfferResponse) {
        const response = await consumeFootprintUsecase.startContractNegotiation(
          contractOfferResponse.body.contractOffers[0],
          catalogRequest.providerUrl
        );
        context.body = response.body;
        context.status = 200;
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
        context.body = { error: 'invalid company id' };
        context.status = 404;
      } else if (error instanceof ContractNotFound) {
        context.body = { error: 'invalid contractNegotiationId' };
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
