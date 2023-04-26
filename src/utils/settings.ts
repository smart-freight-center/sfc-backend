import 'dotenv/config';

const connectorJSONConfig = JSON.parse(process.env.CONNECTOR_CONFIG || '{}');

export const CLIENT_CONFIG = {
  id: process.env.EDC_ID || connectorJSONConfig.id || 'urn:connector:consumer',
  title:
    process.env.EDC_TITLE ||
    connectorJSONConfig.title ||
    'consumer.edc.think-it.io',
  catalogId:
    process.env.EDC_CATALOG_ID || connectorJSONConfig.catalogId || 'default',
  description:
    process.env.EDC_DESCRIPTION ||
    connectorJSONConfig.description ||
    'The consumer connector for the EDC manager demo',
  region: process.env.EDC_REGION || connectorJSONConfig.region || 'eu-west-1',
  addresses: {
    default: process.env.EDC_DEFAULT || 'http://localhost:19191/api',
    validation:
      process.env.EDC_VALIDATION ||
      connectorJSONConfig?.addresses?.validation ||
      'http://localhost:19292',
    management:
      process.env.EDC_MANAGEMENT ||
      connectorJSONConfig?.addresses?.management ||
      'http://localhost:19193/api/v1/data',
    protocol:
      process.env.EDC_PROTOCOL ||
      connectorJSONConfig?.addresses?.protocol ||
      'http://consumer-connector:9194/api/v1/ids',
    dataplane: process.env.EDC_DATAPLANE || 'http://localhost:19195',
    public:
      process.env.EDC_PUBLIC ||
      connectorJSONConfig?.addresses?.public ||
      'http://localhost:19291/public',
    control:
      process.env.EDC_CONTROL ||
      connectorJSONConfig?.addresses?.control ||
      'http://localhost:19292/control',
  },
};

export const TRANSFER_EXP_PROCESS_IN_SECONDS = 2 * 60 * 60; //2 hours

// eslint-disable-next-line no-use-before-define
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = process.env.REDIS_PORT || '6379';
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
export const REDIS_DB = process.env.REDIS_DATABASE || '';

export const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
export const KEYCLOAK_HOST = process.env.KEYCLOAK_HOST;
export const KEYCLOAK_PUBLIC_KEY = process.env.KEYCLOAK_PUBLIC_KEY || '';
export const SFCAPI_BASEURL = process.env.SFCAPI_BASEURL;

export const AWS_REGION = process.env.AWS_REGION;
export const AWS_ACCESS_ID = process.env.AWS_ACCESS_ID;
export const AWS_SECRET = process.env.AWS_SECRET;

export const PARTICIPANT_CONFIG_URL = process.env.PARTICIPANT_CONFIG_URL || '';
export const CONNECTOR_TOKEN = process.env.CONNECTOR_TOKEN || 'test-token';
