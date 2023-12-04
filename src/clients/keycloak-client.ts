import axios, { AxiosError } from 'axios';
import url from 'url';
import jwt from 'jsonwebtoken';
import {
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET,
  KEYCLOAK_HOST,
  KEYCLOAK_REALM,
} from 'utils/settings';
import {
  AccountNotSetup,
  InvalidCredentials,
  InvalidToken,
  KeyCloakCouldNotGenerateToken,
} from 'utils/errors';
import { AppLogger } from 'utils/logger';

const keyCloakClient = axios.create({
  baseURL: `${KEYCLOAK_HOST}/realms/${KEYCLOAK_REALM}`,
});

const logger = new AppLogger('KeyCloackClient');

export class KeyCloackClient {
  static async generateToken(clientId: string, grantType, clientSecret) {
    try {
      const body = new url.URLSearchParams({
        grant_type: grantType,
        client_id: clientId,
        client_secret: clientSecret,
      });

      const res = await keyCloakClient.post(
        '/protocol/openid-connect/token',
        body
      );

      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        throw new InvalidCredentials();
      }
      logger.error('Error occured while validating tokes in keycloak', {
        error,
      });
      throw new KeyCloakCouldNotGenerateToken();
    }
  }

  static async generateTokenWithPassword(username: string, password: string) {
    try {
      const body = new url.URLSearchParams({
        grant_type: 'password',
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
        username,
        password,
      });

      const res = await keyCloakClient.post(
        '/protocol/openid-connect/token',
        body
      );

      return res.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.response?.status === 401) {
        throw new InvalidCredentials();
      }

      if (axiosError.response?.status === 400) {
        throw new AccountNotSetup();
      }
      logger.error('Error while logging in user with KeyCloak', {
        error: {
          data: axiosError.response?.data,
          status: axiosError.response?.status,
        },
      });
      throw new KeyCloakCouldNotGenerateToken();
    }
  }

  static async verifyToken(publicKey: string, authorization: string) {
    try {
      const completeKey =
        '-----BEGIN PUBLIC KEY-----\n' +
        publicKey +
        '\n-----END PUBLIC KEY-----';

      const accessToken = authorization?.split(' ')[1];

      const data = await jwt.verify(accessToken, completeKey, {
        algorithms: ['RS256'],
      });

      return data;
    } catch (error) {
      throw new InvalidToken();
    }
  }
}
