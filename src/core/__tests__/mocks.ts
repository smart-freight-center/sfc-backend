import { Participant } from 'core/types';

export const mockConsumerConnector = {
  default: 'http://consumer:29191/api',
  validation: 'http://consumer:29292',
  management: 'http://consumer:29193/api/v1/data',
  protocol: 'http://provider-connector:9194/api/v1/ids',
  dataplane: 'http://consumer:29195',
  public: 'http://consumer:29291/public',
  control: 'http://consumer:29292/control',
};

export const mockProviderConnector = {
  default: 'http://provider-host:29191/api',
  validation: 'http://provider-host:29292',
  management: 'http://provider-host:29193/api/v1/data',
  protocol: 'http://provider-connector:9194/api/v1/ids',
  dataplane: 'http://provider-host:29195',
  public: 'http://provider-host:29291/public',
  control: 'http://provider-host:29292/control',
};
export const mockProvider: Participant = {
  company_name: 'data-provider',
  client_id: 'provider',
  company_BNP: 'provider-bpn',
  role: 'shipper',
  connection: ['data-consuer'],
  public_key: 'provider-pb',
  connector_data: {
    id: 'urn:connector:provider',
    addresses: mockProviderConnector,
  },
};

export const mockConsumer: Participant = {
  company_name: 'data-consumer',
  client_id: 'consumer',
  company_BNP: 'consumer-bpn',
  role: 'lsp',
  connection: ['data-provider'],
  public_key: 'consumer-pb',
  connector_data: {
    id: '',
    addresses: mockConsumerConnector,
  },
};
