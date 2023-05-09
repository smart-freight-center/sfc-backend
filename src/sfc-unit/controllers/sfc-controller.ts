import { RouterContext } from '@koa/router';
import { ParticipantGateway } from 'sfc-unit/dataGateways';

import { retrieveCompaniesConnectionUsecase } from 'sfc-unit/usecases';
import { ParticipantNotFound } from 'utils/error';
import { AppLogger } from 'utils/logger';

const logger = new AppLogger('SFCUnitController');
export class SFCUnitController {
  static async companies(context: RouterContext) {
    logger.info('Retrieving companies...');
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
      logger.error('Something is not correct in the SFC unit...', { error });
      context.status = 503;
    }
  }

  static async profile(context: RouterContext) {
    logger.info('Retrieving companies...');
    try {
      context.status = 200;
      context.body = await ParticipantGateway.getParticipant(
        context.decoded.clientId
      );
    } catch (error) {
      if (error instanceof ParticipantNotFound) {
        context.status = 403;
        context.body = { error: 'invalid token' };
        return;
      }
      logger.error('Something is not correct in the SFC unit...', { error });
      context.status = 503;
    }
  }
}
