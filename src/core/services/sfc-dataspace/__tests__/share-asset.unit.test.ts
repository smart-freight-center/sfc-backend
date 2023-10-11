import { validate } from 'uuid';
import { Participant } from 'core/types';
import { SfcDataSpace } from '../sfc-dataspace';
import { mockEdcClient } from './stubs';
import { expect } from 'chai';
import { ShipmentAlreadyShared } from 'utils/errors';
import sinon, { SinonFakeTimers } from 'sinon';

const sfcDataspace = new SfcDataSpace(mockEdcClient);

const mockConsumerConnector = {
  default: 'http://consumer:29191/api',
  validation: 'http://consumer:29292',
  management: 'http://consumer:29193/api/v1/data',
  protocol: 'http://provider-connector:9194/api/v1/ids',
  dataplane: 'http://consumer:29195',
  public: 'http://consumer:29291/public',
  control: 'http://consumer:29292/control',
};

const mockProviderConnector = {
  default: 'http://provider-host:29191/api',
  validation: 'http://provider-host:29292',
  management: 'http://provider-host:29193/api/v1/data',
  protocol: 'http://provider-connector:9194/api/v1/ids',
  dataplane: 'http://provider-host:29195',
  public: 'http://provider-host:29291/public',
  control: 'http://provider-host:29292/control',
};
const provider: Participant = {
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

const consumer: Participant = {
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

const mockShareAssetInput = {
  provider,
  consumer,
  month: 10,
  year: 2023,
  numberOfRows: 100,
  shipmentId: 'my-shipment-id',
  companyId: consumer.client_id,
  type: 's3' as const,
  dataLocation: {
    name: 'my-file',
    bucketName: 'provider-bucket',
    accessKeyId: 'provider-aws-secret-key',
    secretAccessKey: 'provider-aws-scret-key',
  },
};
const now = new Date();
let clock: SinonFakeTimers;

describe('SfcDataspace', () => {
  describe('Share Asset to connector', () => {
    beforeEach(() => {
      clock = sinon.useFakeTimers(now.getTime());

      mockEdcClient.createAsset.reset();
      mockEdcClient.createPolicy.reset();
      mockEdcClient.createContractDefinitions.reset();

      mockEdcClient.createAsset.returns(
        Promise.resolve({ id: 'new-asset-id', createdAt: 50 })
      );
      mockEdcClient.createPolicy.returns(
        Promise.resolve({ id: 'new-policy-id', createdAt: 50 })
      );
      mockEdcClient.createContractDefinitions.returns(
        Promise.resolve({
          id: 'new-contract-definition',
          createdAt: 60,
        })
      );
    });

    afterEach(() => {
      clock.restore();
    });

    it('should throw error when asset has been created previously', async () => {
      mockEdcClient.listAssets.returns(
        Promise.resolve([
          {
            accessPolicyId: '',
            contractPolicyId: '',
          },
        ] as any)
      );

      await expect(
        sfcDataspace.shareAsset(mockShareAssetInput)
      ).to.be.rejectedWith(ShipmentAlreadyShared);
    });

    it('should create an asset on the connector', async () => {
      mockEdcClient.listAssets.returns(Promise.resolve([]));
      const consumerId = consumer.client_id;
      await sfcDataspace.shareAsset(mockShareAssetInput);

      mockEdcClient.createAsset.should.have.been.calledOnce;

      mockEdcClient.createAsset.firstCall.firstArg.should.containSubset({
        properties: {
          month: mockShareAssetInput.month,
          numberOfRows: mockShareAssetInput.numberOfRows,
          year: mockShareAssetInput.year,
          owner: provider.client_id,
          sharedWith: consumerId,
        },
        privateProperties: {},
        dataAddress: {
          name: 'my-file',
          '@type': 'AmazonS3',
          type: 'AmazonS3',
          bucketName: 'provider-bucket',
          accessKeyId: 'provider-aws-secret-key',
          secretAccessKey: 'provider-aws-scret-key',
        },
      });

      mockEdcClient.createAsset.firstCall.firstArg['@id'].should.not.be.null;
    });

    it('should correctly create a policy using the companyBPN', async () => {
      mockEdcClient.listAssets.returns(Promise.resolve([]));
      await sfcDataspace.shareAsset(mockShareAssetInput);

      mockEdcClient.createPolicy.should.have.been.calledOnceWithExactly({
        policy: {
          permission: [
            {
              constraints: [
                {
                  edctype: 'AtomicConstraint',
                  leftExpression: {
                    edctype: 'dataspaceconnector:literalexpression',
                    value: 'BusinessPartnerNumber',
                  },
                  rightExpression: {
                    edctype: 'dataspaceconnector:literalexpression',
                    value: consumer.company_BNP,
                  },
                  operator: 'EQ',
                },
              ],
              action: {
                type: 'USE',
              },
              edctype: 'dataspaceconnector:permission',
            },
          ],
        },
      });
    });

    it('should correctly create a contract definitions using the companyBPN', async () => {
      mockEdcClient.listAssets.returns(Promise.resolve([]));

      await sfcDataspace.shareAsset(mockShareAssetInput);

      mockEdcClient.createContractDefinitions.should.have.been.calledOnce;

      const contractArgument =
        mockEdcClient.createContractDefinitions.firstCall.firstArg;

      contractArgument.should.containSubset({
        accessPolicyId: 'new-policy-id',
        contractPolicyId: 'new-policy-id',
        assetsSelector: [
          {
            operandLeft: 'https://w3id.org/edc/v0.0.1/ns/id',
            operator: '=',
            operandRight: 'new-asset-id',
          },
        ],
      });

      contractArgument['@id'].startsWith('new-asset-id-').should.be.true;

      validate(contractArgument['@id'].replace('new-asset-id-', '')).should.be
        .true;
    });
  });
});
