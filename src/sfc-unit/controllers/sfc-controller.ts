import { RouterContext } from '@koa/router';

import { retrieveCompaniesConnectionUsecase } from 'sfc-unit/usecases';
import { ParticipantNotFound } from 'utils/error';

export class SFCUnitController {
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
}