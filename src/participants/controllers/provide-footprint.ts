import { ShareFootprintInput } from 'entities';
import { EmptyFootprintData, InvalidFootprintData } from 'utils/error';
import { ContractNotFound, InvalidInput } from 'utils/error';
import {
  initiateFileTransferUsecase,
  provideFootprintUsecase,
  shareFootprintUsecase,
} from 'participants/usecases';
import { RouterContext } from '@koa/router';
import {
  EdcConnectorClientError,
  EdcConnectorClientErrorType,
} from '@think-it-labs/edc-connector-client';

export class ProvideFootPrintController {
  static async shareFootprints(context: RouterContext) {
    try {
      const data = await shareFootprintUsecase.execute(
        context.headers.authorization as string,
        context.request.body as ShareFootprintInput
      );

      context.status = 201;
      context.body = data;
    } catch (error) {
      if (error instanceof InvalidInput) {
        context.status = 400;
        context.body = { errors: error.errors };
        return;
      }
      if (error instanceof EmptyFootprintData) {
        context.status = 400;
        context.body = { message: 'The datasource is empty' };
        return;
      }
      if (error instanceof InvalidFootprintData) {
        context.status = 400;
        context.body = {
          message:
            'The footprint data you specified does not meet the data model',
          errors: error.errors,
        };
        return;
      }
      if (error instanceof EdcConnectorClientError) {
        if (error.type === EdcConnectorClientErrorType.Unknown) {
          context.status = 503;
        } else if (error.type === EdcConnectorClientErrorType.Duplicate) {
          context.status = 409;
          context.body = {
            error: 'A shipment with that id has already been created',
          };
        } else {
          context.status = 500;
        }
        return;
      }
      console.log(error);
      context.status = 500;
    }
  }

  static async unshareFootprint(context: RouterContext) {
    const { shipmentId } = context.params;
    console.log("Unsharing assets... ", shipmentId)
    try {
      const contractToBecanceled =
        await initiateFileTransferUsecase.getContractOffer(shipmentId);

      console.log("Got contract : ", contractToBecanceled)
      if (contractToBecanceled.id) {
        await provideFootprintUsecase.delete(
          contractToBecanceled.id.split(':')[0]
        );
        context.status = 200;
        context.body = 'access revoked successfully';
      }
    } catch (error) {
      console.log("=====================")
      console.log(error)
      console.log("=====================")
      if (error instanceof ContractNotFound) {
        context.status = 404;
        context.body = {
          error: `No shipment with id ${shipmentId} is currently shared`,
        };
      }
      if (error instanceof InvalidInput) {
        context.status = 400;
        return;
      }
      context.status = 500;
    }
  }

  static async getSharedFootprints(context: RouterContext) {
    try {
      const assets = await provideFootprintUsecase.list();
      context.body = assets;
      context.status = 200;
    } catch (error) {
      if (error instanceof InvalidInput) {
        context.status = 400;
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
