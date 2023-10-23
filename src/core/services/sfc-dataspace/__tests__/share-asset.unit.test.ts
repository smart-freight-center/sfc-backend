import { validate } from 'uuid';
import { SfcDataSpace } from '../sfc-dataspace';
import { mockEdcClient } from './stubs';
import { expect } from 'chai';
import { ShipmentAlreadyShared } from 'utils/errors';
import sinon, { SinonFakeTimers } from 'sinon';
import { mockProvider, mockConsumer } from 'core/__tests__/mocks';

const sfcDataspace = new SfcDataSpace(mockEdcClient);

const mockShareAssetInput = {
  provider: mockProvider,
  consumer: mockConsumer,
  month: 10,
  year: 2023,
  numberOfRows: 100,
  shipmentId: 'my-shipment-id',
  companyId: mockConsumer.client_id,
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
        Promise.resolve({ id: 'new-asset-id', createdAt: 50 } as any)
      );
      mockEdcClient.createPolicy.returns(
        Promise.resolve({ id: 'new-policy-id', createdAt: 50 } as any)
      );
      mockEdcClient.createContractDefinitions.returns(
        Promise.resolve({
          id: 'new-contract-definition',
          createdAt: 60,
        } as any)
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
      const consumerId = mockConsumer.client_id;
      await sfcDataspace.shareAsset(mockShareAssetInput);

      mockEdcClient.createAsset.should.have.been.calledOnce;

      mockEdcClient.createAsset.firstCall.firstArg.should.containSubset({
        properties: {
          month: mockShareAssetInput.month,
          numberOfRows: mockShareAssetInput.numberOfRows,
          year: mockShareAssetInput.year,
          owner: mockProvider.client_id,
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
                    value: mockConsumer.company_BNP,
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
            operandLeft: 'https://w3id.org/edc/v0.0.1/ns/owner',
            operator: '=',
            operandRight: 'provider',
          },
          {
            operandLeft: 'https://w3id.org/edc/v0.0.1/ns/month',
            operandRight: 10,
            operator: '=',
          },
          {
            operandLeft: 'https://w3id.org/edc/v0.0.1/ns/year',
            operandRight: 2023,
            operator: '=',
          },
          {
            operandLeft: 'https://w3id.org/edc/v0.0.1/ns/sharedWith',
            operandRight: 'consumer',
            operator: '=',
          },
        ],
      });

      contractArgument['@id'].startsWith('new-asset-id-').should.be.true;

      validate(contractArgument['@id'].replace('new-asset-id-', '')).should.be
        .true;
    });
  });
});
