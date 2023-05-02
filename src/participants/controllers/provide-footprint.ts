import { ShareFootprintInput } from 'entities';
import {
  EmptyFootprintData,
  InvalidFootprintData,
  InvalidInput,
} from 'utils/error';
import {
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
