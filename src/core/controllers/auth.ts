import { RouterContext } from '@koa/router';
import { InvalidInput, KeyCloakCouldNotGenerateToken } from 'core/error';
import { TokenInput } from 'core/types';
import { generateTokenUsecase } from 'core/usecases';
import { KeyCloackClient } from 'core/clients/KeyCloackClient';

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
      } else if (error instanceof KeyCloakCouldNotGenerateToken) {
        context.body = { error: 'Service unavailable' };
        context.status = 503;
        console.error(error);
      } else {
        context.status = 500;
      }
    }
  }

  static async authMiddleware(context: RouterContext, next) {
    const authorization = context.request.headers.authorization;

    try {
      const decoded = await KeyCloackClient.verifyToken(authorization || '');

      context.decoded = decoded;
      next();
    } catch (error) {
      context.body = {
        error: 'invalid token',
      };

      context.status = 401;
    }
  }
}
