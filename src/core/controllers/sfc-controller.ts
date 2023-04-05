import { RouterContext } from '@koa/router';

import { ParticipantNotFound } from 'core/error';
import { retrieveCompaniesConnectionUsecase } from 'core/usecases';

export class SFCUnitController {
  static async companies(context: RouterContext) {
    try {
      context.status = 200;
      context.body = await retrieveCompaniesConnectionUsecase.listCompanies(
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
}
