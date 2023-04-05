import { RouterContext } from '@koa/router';
import { CatalogRequest } from '../entities';
import { InvalidInput } from '../error';
import {
  consumeFootprintUsecase,
  retrieveCompaniesConnectionUsecase,
} from '../usecases';

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
      if (
        !['companyId', 'contractNegotiationId'].every((param) =>
          Object.prototype.hasOwnProperty.call(context.query, param)
        )
      ) {
        context.status = 400;
        throw new Error('Invalid given query parameters');
      }
      const contractNegotiationId = context.query
        .contractNegotiationId as string;
      const companyId = context.query.companyId as string;
      const providerCompany =
        await retrieveCompaniesConnectionUsecase.getCompany(companyId);

      const contractNegotiationResponse =
        await consumeFootprintUsecase.getContractNegotiationResponse(
          contractNegotiationId
        );
      if (!providerCompany) {
        context.status = 400;
        throw new Error('Please enter a valid client id');
      }

      if (contractNegotiationResponse.body.contractAgreementId) {
        const response = await consumeFootprintUsecase.initiateTransferProcess(
          shipmentId,
          providerCompany.connector_data.id,
          providerCompany.connector_data.addresses.protocol,
          contractNegotiationResponse.body.contractAgreementId
        );
        context.body = response.body;
        context.status = 200;
      } else {
        context.status = 400;
        throw new Error(
          'Please verify the state of your contract negotiation and retry again'
        );
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
}
