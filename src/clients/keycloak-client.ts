import axios, { AxiosError } from 'axios';
import url from 'url';
import jwt from 'jsonwebtoken';
import { KEYCLOAK_HOST, KEYCLOAK_REALM } from 'utils/settings';
import { InvalidCredentials, KeyCloakCouldNotGenerateToken } from 'utils/error';

const keyCloakClient = axios.create({
  baseURL: `${KEYCLOAK_HOST}/realms/${KEYCLOAK_REALM}`,
});

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
      console.log(error);
      throw new KeyCloakCouldNotGenerateToken();
    }
  }

  static async verifyToken(publicKey: string, authorization: string) {
    const completeKey =
      '-----BEGIN PUBLIC KEY-----\n' + publicKey + '\n-----END PUBLIC KEY-----';

    const accessToken = authorization?.split(' ')[1];

    const data = await jwt.verify(accessToken, completeKey, {
      algorithm: ['RS256'],
    });

    return data;
  }

  static async decodeToken(authorization: string) {
    const accessToken = authorization?.split(' ')[1] || '';
    const data = jwt.decode(accessToken);
    return data;
  }
}
