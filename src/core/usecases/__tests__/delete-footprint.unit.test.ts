import { SfcDataSpace } from 'core/services/sfc-dataspace/sfc-dataspace';
import { DeleteFootprintUsecase } from '../delete-fooprint';
import { sfcConnectionStub } from './stubs';
import { mockEdcClient } from 'core/services/sfc-dataspace/__tests__/stubs';
import { expect } from 'chai';
import { DataValidationError } from 'utils/errors/base-errors';
import { ShipmentForMonthNotFound } from 'utils/errors';
import { mockProvider } from 'core/__tests__/mocks';
import {
  ContractDefinition,
  expandArray,
} from '@think-it-labs/edc-connector-client';

const { mockSfcAPI, mockSFCAPIConnection } = sfcConnectionStub();

const mockSfcDataspace = new SfcDataSpace(mockEdcClient);

const deleteFootprintUsecase = new DeleteFootprintUsecase(
  mockSfcAPI,
  mockSfcDataspace
);

describe('Delete Footprint Tests', () => {
  beforeEach(() => {
    mockEdcClient.listAssets.reset();
    mockEdcClient.queryAllContractDefinitions.reset();
  });
  it('should throw error when the values are wrong', async () => {
    const { errors } = await expect(
      deleteFootprintUsecase.execute('provider-auth', {
        month: '19',
        year: 'invalid-year',
        companyId: 'consumer-id',
      })
    ).to.be.rejectedWith(DataValidationError);
    errors.should.be.eql({
      year: ['This field must be a number'],
      month: ['This field must be less than 13'],
    });
  });

  it('should throw error when the the asset does not exists', async () => {
    mockSFCAPIConnection.getMyProfile.returns(
      Promise.resolve({ ...mockProvider, client_id: 'provider-client' })
    );
    mockEdcClient.listAssets.returns(Promise.resolve([]));
    await expect(
      deleteFootprintUsecase.execute('provider-auth', {
        month: '8',
        year: '2021',
        companyId: 'consumer-id',
      })
    ).to.be.rejectedWith(ShipmentForMonthNotFound);
  });

  it('should delete asset that is found', async () => {
    const validInput = {
      month: '8',
      year: '2021',
      companyId: 'consumer-id',
    };
    mockSFCAPIConnection.getMyProfile.returns(
      Promise.resolve({ ...mockProvider, client_id: 'provider-client' })
    );

    const body = [
      {
        '@id': 'sample-asset-id',
        '@type': 'edc:ContractDefinition',
        'edc:accessPolicyId': '47124592-34cc-44e7-b31f-778afa3ff5f3',
        'edc:contractPolicyId': '47124592-34cc-44e7-b31f-778afa3ff5f3',
        'edc:assetsSelector': [
          {
            '@type': 'edc:Criterion',
            'edc:operandLeft': 'https://w3id.org/edc/v0.0.1/ns/owner',
            'edc:operator': '=',
            'edc:operandRight': 'provider-client',
          },
          {
            '@type': 'edc:Criterion',
            'edc:operandLeft': 'https://w3id.org/edc/v0.0.1/ns/month',
            'edc:operator': '=',
            'edc:operandRight': '12',
          },
          {
            '@type': 'edc:Criterion',
            'edc:operandLeft': 'https://w3id.org/edc/v0.0.1/ns/year',
            'edc:operator': '=',
            'edc:operandRight': '2023',
          },
          {
            '@type': 'edc:Criterion',
            'edc:operandLeft': 'https://w3id.org/edc/v0.0.1/ns/sharedWith',
            'edc:operator': '=',
            'edc:operandRight': validInput.companyId,
          },
        ],
        '@context': {
          dct: 'https://purl.org/dc/terms/',
          edc: 'https://w3id.org/edc/v0.0.1/ns/',
          dcat: 'https://www.w3.org/ns/dcat/',
          odrl: 'http://www.w3.org/ns/odrl/2/',
          dspace: 'https://w3id.org/dspace/v0.8/',
        },
      },
    ];

    mockEdcClient.queryAllContractDefinitions.returns(
      expandArray(body, () => new ContractDefinition())
    );
    await expect(
      deleteFootprintUsecase.execute('provider-auth', {
        month: '8',
        year: '2021',
        companyId: 'consumer-id',
      })
    ).to.not.be.rejected;

    mockEdcClient.deleteContractDefinition.should.have.been.calledOnceWith(
      'sample-asset-id'
    );

    mockEdcClient.queryAllContractDefinitions.should.have.been.calledOnceWith({
      filterExpression: [
        {
          operandLeft: 'assetsSelector.operandRight',
          operator: '=',
          operandRight: 'provider-client',
        },
        {
          operandLeft: 'assetsSelector.operandLeft',
          operator: '=',
          operandRight: 'https://w3id.org/edc/v0.0.1/ns/owner',
        },
        {
          operandLeft: 'assetsSelector.operandRight',
          operator: '=',
          operandRight: 'consumer-id',
        },
        {
          operandLeft: 'assetsSelector.operandLeft',
          operator: '=',
          operandRight: 'https://w3id.org/edc/v0.0.1/ns/sharedWith',
        },
        {
          operandLeft: 'assetsSelector.operandRight',
          operator: '=',
          operandRight: '8',
        },
        {
          operandLeft: 'assetsSelector.operandLeft',
          operator: '=',
          operandRight: 'https://w3id.org/edc/v0.0.1/ns/month',
        },
        {
          operandLeft: 'assetsSelector.operandRight',
          operator: '=',
          operandRight: '2021',
        },
        {
          operandLeft: 'assetsSelector.operandLeft',
          operator: '=',
          operandRight: 'https://w3id.org/edc/v0.0.1/ns/year',
        },
      ],
    });
  });
});
