import 'dotenv/config';
import fs from 'fs';

const CONNECTOR_JSON_IN_DEV = process.env.CONNECTOR_JSON_IN_DEV || '';

let connectorJSONConfig;

if (
  fs.existsSync(CONNECTOR_JSON_IN_DEV) &&
  fs.lstatSync(CONNECTOR_JSON_IN_DEV).isFile()
) {
  const details = fs.readFileSync(CONNECTOR_JSON_IN_DEV, 'utf-8');
  connectorJSONConfig = JSON.parse(details);
} else {
  connectorJSONConfig = JSON.parse(process.env.CONNECTOR_CONFIG || '{}');
}

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
  token: process.env.EDC_TOKEN || connectorJSONConfig.token,
  addresses: {
    default: process.env.EDC_DEFAULT || 'http://localhost:19191/api',
    validation:
      process.env.EDC_VALIDATION ||
      connectorJSONConfig?.addresses?.validation ||
      'http://localhost:19292',
    management:
      process.env.EDC_MANAGEMENT ||
      connectorJSONConfig?.addresses?.management ||
      'http://localhost:29193/management',
    protocol:
      process.env.EDC_PROTOCOL ||
      connectorJSONConfig?.addresses?.protocol ||
      'http://consumer-connector:9194/protocol',
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

export const TRANSFER_EXP_PROCESS_IN_SECONDS = 10 * 60; // 10 minutes

// eslint-disable-next-line no-use-before-define
export const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
export const REDIS_PORT = process.env.REDIS_PORT || '6379';
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD || '';
export const REDIS_DB = process.env.REDIS_DATABASE || '';

export const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || 'master';
export const KEYCLOAK_HOST = process.env.KEYCLOAK_HOST || 'localhost:8080';
export const KEYCLOAK_ADMIN_USERNAME = process.env.KEYCLOAK_ADMIN_USERNAME || 'user';
export const KEYCLOAK_ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || '';
export const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || '';
export const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || '';

export const SFCAPI_BASEURL = process.env.SFCAPI_BASEURL;

const SUPPORTED_EDC_FILTER_OPERATORS =
  process.env.SUPPORTED_EDC_FILTER_OPERATORS || 'LIKE,=';

export const EDC_FILTER_OPERATOR_SET = new Set(
  SUPPORTED_EDC_FILTER_OPERATORS.toUpperCase().split(',')
);
export const AWS_REGION = process.env.AWS_REGION;
export const AWS_ACCESS_ID = process.env.AWS_ACCESS_ID;
export const AWS_SECRET = process.env.AWS_SECRET;

export const PARTICIPANT_CONFIG_S3_BUCKET =
  process.env.PARTICIPANT_CONFIG_S3_BUCKET;
export const PARTICIPANT_CONFIG_KEY = process.env.PARTICIPANT_CONFIG_KEY;
