import axios from 'axios';
import url from 'url';
import jwt from 'jsonwebtoken';
import {
  KEYCLOAK_HOST,
  KEYCLOAK_PUBLIC_KEY,
  KEYCLOAK_REALM,
} from 'utils/settings';
import { KeyCloakCouldNotGenerateToken } from 'core/error';

const keyCloakClient = axios.create({
  baseURL: `${KEYCLOAK_HOST}/realms/${KEYCLOAK_REALM}`,
});

const realmPublicKey =
  '-----BEGIN PUBLIC KEY-----\n' +
  KEYCLOAK_PUBLIC_KEY +
  '\n-----END PUBLIC KEY-----';

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
      throw new KeyCloakCouldNotGenerateToken();
    }
  }

  static async verifyToken(authorization: string) {
    const accessToken = authorization?.split(' ')[1];

    const data = await jwt.verify(accessToken, realmPublicKey, {
      algorithm: ['RS256'],
    });

    return data;
  }
}
