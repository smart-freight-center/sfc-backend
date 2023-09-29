import { RouterContext } from '@koa/router';

import { KeyCloackClient } from 'clients/keycloak-client';
import { KEYCLOAK_PUBLIC_KEY } from 'utils/settings';
import { generateTokenUsecase } from 'core/usecases';

import { TokenInput } from 'clients/interfaces';
import {
  InvalidInput,
  InvalidCredentials,
  KeyCloakCouldNotGenerateToken,
} from 'utils/errors';

export class AuthController {
  static async generateToken(context: RouterContext) {
    try {
      const data = await generateTokenUsecase.execute(
        context.request.body as TokenInput
      );
      context.body = data;
      context.status = 200;
    } catch (error) {
      if (error instanceof InvalidInput) {
        context.body = { errors: error.errors };
        context.status = 400;
      } else if (error instanceof InvalidCredentials) {
        context.body = { error: 'invalid credentials' };
        context.status = 401;
      } else if (error instanceof KeyCloakCouldNotGenerateToken) {
        context.body = { error: 'Service unavailable' };
        context.status = 503;
        console.error(error);
      } else {
        context.status = 500;
        console.error(error);
      }
    }
  }

  static async authMiddleware(context: RouterContext, next) {
    const authorization = context.request.headers.authorization || '';

    try {
      const decoded = await KeyCloackClient.verifyToken(
        KEYCLOAK_PUBLIC_KEY,
        authorization
      );
      context.decoded = decoded;
      return next();
    } catch (error) {
      context.body = {
        error: 'invalid token',
      };

      context.status = 401;
    }
  }
}
