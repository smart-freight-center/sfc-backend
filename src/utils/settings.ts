import 'dotenv/config';
import dbConfig from 'sfc-unit/infrastructure/db/config';

export const CLIENT_CONFIG = (process.env.CONNECTOR_CONFIG &&
  JSON.parse(process.env.CONNECTOR_CONFIG as string)) ?? {
  id: 'urn:connector:consumer',
  title: 'consumer.edc.think-it.io',
  catalogId: 'default',
  description: 'The consumer connector for the EDC manager demo',
  region: 'eu-west-1',
  addresses: {
    default: 'http://localhost:19191/api',
    validation: 'http://localhost:19292',
    management: 'http://localhost:19193/api/v1/data',
    protocol: 'http://consumer-connector:9194/api/v1/ids',
    dataplane: 'http://localhost:19195',
    public: 'http://localhost:19291/public',
    control: 'http://localhost:19292/control',
  },
};

export const TRANSFER_EXP_PROCESS_IN_SECONDS = 2 * 60 * 60; //2 hours

const DATABASE_CONFIG = {
  ...dbConfig,
};

type DATABASE_ENVS = keyof typeof DATABASE_CONFIG;
const APP_ENV = (process.env.NODE_ENV as DATABASE_ENVS) || 'development';

// eslint-disable-next-line no-use-before-define
export const SEQUELIZE_CONFIG = DATABASE_CONFIG[APP_ENV];
export const REDIS_URL = process.env.REDIS_URL || '';
export const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
export const KEYCLOAK_HOST = process.env.KEYCLOAK_HOST;
export const KEYCLOAK_PUBLIC_KEY = process.env.KEYCLOAK_PUBLIC_KEY || '';
export const SFCAPI_BASEURL = process.env.SFCAPI_BASEURL;
