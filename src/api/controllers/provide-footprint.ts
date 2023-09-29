import { ShareFootprintInput } from 'entities';
import {
  CouldntFetchDataInSource,
  EmptyFootprintData,
  InvalidFootprintData,
  InvalidShipmentIdFormat,
  ParticipantNotFound,
  ShipmentAlreadyShared,
  ContractNotFound,
  InvalidInput,
} from 'utils/errors';
import {
  deleteFootprintUsecase,
  provideFootprintUsecase,
  shareFootprintUsecase,
} from 'core/usecases';
import { RouterContext } from '@koa/router';
import {
  EdcConnectorClientError,
  EdcConnectorClientErrorType,
} from '@think-it-labs/edc-connector-client';

export class ProvideFootPrintController {
  static async shareFootprints(context: RouterContext) {
    try {
      await shareFootprintUsecase.execute(
        context.headers.authorization as string,
        context.request.body as ShareFootprintInput
      );

      context.status = 201;
      context.body = { message: 'Successfully shared a shipment' };
    } catch (error) {
      if (error instanceof InvalidInput) {
        context.status = 400;
        context.body = { errors: error.errors };
        return;
      }
      if (error instanceof EmptyFootprintData) {
        context.status = 400;
        context.body = {
          message: 'The datasource is empty or has only the header',
        };
        return;
      }
      if (error instanceof ShipmentAlreadyShared) {
        context.status = 409;
        context.body = {
          message:
            'This shipment has already been shared with that company. You can make updates to the data source instead',
        };
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
      if (error instanceof ParticipantNotFound) {
        context.status = 404;
        context.body = {
          error: 'Participant not found',
        };
        return;
      }

      if (error instanceof CouldntFetchDataInSource) {
        context.status = 400;
        context.body = {
          error: "Couldn't fetch data in the specified source",
        };
        return;
      }

      if (error instanceof InvalidShipmentIdFormat) {
        context.status = 400;
        context.body = {
          message: 'The shipment Id should not containt `-`, `:`, `?` or `_`',
        };
      }
      console.log(error);
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
      context.status = 500;
    }
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