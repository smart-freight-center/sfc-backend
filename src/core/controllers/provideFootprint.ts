import { RouterContext } from '@koa/router';
import { ShareFootprintInput } from '../entities';
import { InvalidInput } from '../error';
import { ParticipantNotFound } from '../error';
import {
  retrieveCompaniesConnectionUsecase,
  provideFootprintUsecase,
} from '../usecases';

export class ProvideFootPrintController {
  static async shareFootprints(context: RouterContext) {
    try {
      const response = await provideFootprintUsecase.share(
        context.request.body as ShareFootprintInput
      );
      if (response) {
        context.body = response.body;
        context.status = 201;
      } else {
        context.body = 'an error occurred while processing your request';
        context.status = 400;
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

  static async companies(context: RouterContext) {
    try {
      context.status = 200;
      context.body = await retrieveCompaniesConnectionUsecase.execute(
        context.decoded.clientId
      );
    } catch (error) {
      if (error instanceof ParticipantNotFound) {
        context.status = 403;
        context.body = { error: 'invalid token' };
        return;
      }
      console.log(error);
      context.status = 503;
    }
  }
  static async getSharedFootprints(context: RouterContext) {
    try {
      const response = await provideFootprintUsecase.list();
      context.body = response.body;
      context.status = 200;
    } catch (error) {
      if (error instanceof InvalidInput) {
        context.status = 400;
        return;
      }

      context.status = 500;
    }
  }
}
