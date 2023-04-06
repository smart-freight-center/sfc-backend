import { RouterContext } from '@koa/router';
import { KeyCloackClient } from 'clients/keycloak-client';
import { ParticipantGateway } from 'sfc-unit/dataGateways';

export class SFCAuthController {
  static async sfcUnitAuthMiddleware(context: RouterContext, next) {
    const authorization = context.request.headers.authorization || '';

    try {
      const decoded = await KeyCloackClient.decodeToken(authorization);

      const participant = await ParticipantGateway.getParticipant(
        decoded.clientId
      );

      const verifiedData = await KeyCloackClient.verifyToken(
        participant.public_key,
        authorization
      );

      context.decoded = verifiedData;

      next();
    } catch (error) {
      context.body = {
        error: 'invalid token',
      };

      context.status = 401;
    }
  }
}
