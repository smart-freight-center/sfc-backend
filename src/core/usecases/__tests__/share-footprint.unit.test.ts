import { DataValidationError } from 'utils/errors/base-errors';
import { ShareFootprintUsecase } from '../share-footprint';
import {
  mockDataSourceFetcher,
  mockSfcDataSpace,
  sfcConnectionStub,
} from './stubs';
import { expect } from 'chai';

const { mockSfcAPI } = sfcConnectionStub();

const shareFootprint = new ShareFootprintUsecase(
  mockSfcDataSpace,
  mockDataSourceFetcher,
  mockSfcAPI
);

const mockInput = {
  month: 10,
  year: 2023,
  companyId: 'consumer-id',
  dateCreated: '2020-01-01',
  type: 's3',
  dataLocation: {},
};

describe('ShareFootprintUsecase', () => {
  describe('Input validation', () => {
    it('should throw an error when the input is invalid', async () => {
      const { errors } = await expect(
        shareFootprint.execute('auth-code', {})
      ).to.be.rejectedWith(DataValidationError);

      errors.should.be.eql({
        companyId: ['This field is required'],
        type: ['This field is required'],
        dataLocation: ['This field is required'],
        year: ['This field is required'],
        month: ['This field is required'],
      });
    });

    it('AWS S3 fields should be required when type=s3', async () => {
      const { errors } = await expect(
        shareFootprint.execute('auth-code', mockInput)
      ).to.be.rejectedWith(DataValidationError);

      errors.should.be.eql({
        dataLocation: {
          bucketName: ['This field is required'],
          keyName: ['This field is required'],
          name: ['This field is required'],
          region: ['This field is required'],
        },
      });
    });

    it('Azure Blob fields should be required when type=azure', async () => {
      const { errors } = await expect(
        shareFootprint.execute('auth-code', {
          ...mockInput,
          type: 'azure',
          dataLocation: {},
        })
      ).to.be.rejectedWith(DataValidationError);

      errors.should.be.eql({
        dataLocation: {
          account: ['This field is required'],
          blobname: ['This field is required'],
          container: ['This field is required'],
        },
      });
    });

    it('HTTP  fields should be required when type=http', async () => {
      const { errors } = await expect(
        shareFootprint.execute('auth-code', {
          ...mockInput,
          type: 'http',
          dataLocation: {},
        })
      ).to.be.rejectedWith(DataValidationError);

      errors.should.be.eql({
        dataLocation: {
          baseUrl: ['This field is required'],
          name: ['This field is required'],
        },
      });
    });
  });
});
