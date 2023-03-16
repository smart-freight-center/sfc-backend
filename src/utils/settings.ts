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
