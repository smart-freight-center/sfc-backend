import { RouterContext } from '@koa/router';

import { KeyCloackClient } from 'clients/keycloak-client';
import { generateTokenUsecase } from 'core/usecases';

import { TokenInput } from 'clients/interfaces';

export class AuthController {
  static async generateToken(context: RouterContext) {
    const data = await generateTokenUsecase.execute(
      context.request.body as TokenInput
    );
    context.body = data;
    context.status = 200;
  }

  static async authMiddleware(context: RouterContext, next) {
    const authorization = context.request.headers.authorization || '';

    const decoded = await KeyCloackClient.verifyToken(
      authorization
    );
    context.decoded = decoded;
    return next();
  }
}
