import { SfcDataSpace } from 'core/services/sfc-dataspace/sfc-dataspace';
import { DeleteFootprintUsecase } from '../delete-fooprint';
import { sfcConnectionStub } from './stubs';
import { mockEdcClient } from 'core/services/sfc-dataspace/__tests__/stubs';
import { expect } from 'chai';
import { DataValidationError } from 'utils/errors/base-errors';
import { ShipmentForMonthNotFound } from 'utils/errors';
import { mockProvider } from 'core/__tests__/mocks';
import { Asset } from '@think-it-labs/edc-connector-client';

const { mockSfcAPI, mockSFCAPIConnection } = sfcConnectionStub();

const mockSfcDataspace = new SfcDataSpace(mockEdcClient);

const deleteFootprintUsecase = new DeleteFootprintUsecase(
  mockSfcAPI,
  mockSfcDataspace
);

describe('Delete Footprint Tests', () => {
  beforeEach(() => {
    mockEdcClient.listAssets.reset();
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
    mockEdcClient.listAssets.returns(
      Promise.resolve([
        {
          '@id': 'sample-asset-id',
          '@type': 'edc:Asset',
          'edc:properties': {
            'edc:owner': 'provider-client',
            'edc:numberOfRows': 3.0,
            'edc:month': 12.0,
            'edc:sharedWith': validInput.companyId,
          },
          'edc:dataAddress': {},
        },
      ] as unknown[] as Asset[])
    );
    await expect(
      deleteFootprintUsecase.execute('provider-auth', {
        month: '8',
        year: '2021',
        companyId: 'consumer-id',
      })
    ).to.not.be.rejected;

    mockEdcClient.deleteAsset.should.have.been.calledOnceWith(
      'sample-asset-id'
    );

    mockEdcClient.listAssets.should.have.been.calledOnceWith({
      filterExpression: [
        {
          operandLeft: 'https://w3id.org/edc/v0.0.1/ns/owner',
          operandRight: 'provider-client',
          operator: '=',
        },
        {
          operandLeft: 'https://w3id.org/edc/v0.0.1/ns/sharedWith',
          operandRight: 'consumer-id',
          operator: '=',
        },
        {
          operandLeft: 'https://w3id.org/edc/v0.0.1/ns/month',
          operandRight: +validInput.month,
          operator: '=',
        },
        {
          operandLeft: 'https://w3id.org/edc/v0.0.1/ns/year',
          operandRight: +validInput.year,
          operator: '=',
        },
      ],
    });
  });
});
