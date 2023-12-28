import fs from 'fs';
import path from 'path';
import { DataValidationError } from 'utils/errors/base-errors';
import { ValidateDataModelUsecase } from '../validate-data-model';
import { mockDataSourceFetcher } from './stubs';
import { expect } from 'chai';
import { DataModelValidationFailed, EmptyDataSource } from 'utils/errors';

const mockInCompleteFootprint = fs.readFileSync(
  path.join(__dirname, 'mock-incomplete.csv'),
  { encoding: 'utf-8' }
);
const mockCompleteFootprint = fs.readFileSync(
  path.join(__dirname, 'mock-valid.csv'),
  { encoding: 'utf-8' }
);

const validateDataModel = new ValidateDataModelUsecase(mockDataSourceFetcher);

const mockInput = {
  month: 10,
  year: 2023,
  dateCreated: '2020-01-01',
  type: 's3',
  dataLocation: {},
};

describe('Validate Data Model Usecase', () => {
  describe('Input validation', () => {
    it('should throw an error when the input is invalid', async () => {
      const { errors } = await expect(
        validateDataModel.execute({})
      ).to.be.rejectedWith(DataValidationError);

      errors.should.be.eql({
        type: ['This field is required'],
        dataLocation: ['This field is required'],
        year: ['This field is required'],
        month: ['This field is required'],
      });
    });

    it('AWS S3 fields should be required when type=s3', async () => {
      const { errors } = await expect(
        validateDataModel.execute(mockInput)
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
        validateDataModel.execute({
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
        validateDataModel.execute({
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
  describe('Data Model Validation', () => {
    const validDataModel = {
      id_tce: 'tce_3',
      id_consignment: '3006756',
      id_shipment: 'shipmentid1',
      transport_activity: '200',
      mass: '1000',
      mode_of_transport: 'Air',
      load_factor: '0.3',
      empty_distance: '10',
      energy_carrier_N: '<some string here>',
      Feedstock_N: 'aviation fuel blend',
      accreditation: false,
      verification: false,
      co2e_wtw: 42,
      co2e_ttw: 42,
      transport_operator_name: 'rail',
      temp_control: 'frozen',
      co2e_intensity_wtw: 50,
      co2e_intensity_wtw_unit: 'g/t-km',
      loading_city: 'new york',
      unloading_city: 'montreal',
      loading_country: 'USA',
      unloading_country: 'CA',
      empty_distance_factor_add_information: 'test',
      empty_distance_factor: 0.3,
      id_tce_order: 'test',
      energy_carrier_feedstock_N: 'test',
      distance_activity: 4,
      unloading_date: '2023-12-01',
      loading_date: '2023-11-01',
    };

    beforeEach(() => {
      mockDataSourceFetcher.fetchFootprintData.reset();
    });

    describe('Data source contains CSV', () => {
      it('should throw an error when the data source is empty', async () => {
        mockDataSourceFetcher.fetchFootprintData.returns(Promise.resolve(''));

        const validInput = {
          ...mockInput,
          type: 'http',
          dataLocation: {
            name: 'ShipmentId-1',
            baseUrl: 'http://example.com/footprints.csv',
          },
        };
        await expect(validateDataModel.execute(validInput)).to.be.rejectedWith(
          EmptyDataSource
        );
        mockDataSourceFetcher.fetchFootprintData.should.have.been.calledOnceWithExactly(
          validInput
        );
      });

      it('should throw an error if one or more rows in the csv has an invalid value', async () => {
        mockDataSourceFetcher.fetchFootprintData.returns(
          Promise.resolve(mockInCompleteFootprint.trim())
        );

        const validInput = {
          ...mockInput,
          type: 'http' as const,
          dataLocation: {
            name: 'ShipmentId-1',
            baseUrl: 'http://example.com/footprints.csv',
          },
        };
        const { errors } = await expect(
          validateDataModel.execute(validInput)
        ).to.be.rejectedWith(DataModelValidationFailed);

        errors.should.be.eql({
          loading_date: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          distance_activity: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          empty_distance_factor: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          energy_carrier_feedstock_N: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          id_tce_order: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          loading_city: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          loading_country: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          temp_control: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          transport_operator_name: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          unloading_city: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          unloading_country: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          unloading_date: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          verification: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          co2e_intensity_wtw_unit: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          co2e_intensity_wtw: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          mode_of_transport: {
            msgs: [
              'must be one of [rail, road, sea, air, inland waterway, hub]',
            ],
            rows: [2],
          },
        });
        mockDataSourceFetcher.fetchFootprintData.should.have.been.calledOnceWithExactly(
          validInput
        );
      });
      it('should not throw an error for valid data model', async () => {
        mockDataSourceFetcher.fetchFootprintData.returns(
          Promise.resolve(mockCompleteFootprint.trim())
        );

        const validInput = {
          ...mockInput,
          type: 'http' as const,
          month: 11,
          year: 2023,
          dataLocation: {
            name: 'ShipmentId-1',
            baseUrl: 'http://example.com/footprints.csv',
          },
        };
        await expect(validateDataModel.execute(validInput)).to.not.be.rejected;
        mockDataSourceFetcher.fetchFootprintData.should.have.been.calledOnceWithExactly(
          validInput
        );
      });
    });

    describe('Data source contains JSON', () => {
      it('should throw an error when the data source is empty', async () => {
        mockDataSourceFetcher.fetchFootprintData.returns(
          Promise.resolve(JSON.stringify([]))
        );

        const validInput = {
          ...mockInput,
          type: 'http' as const,
          dataLocation: {
            name: 'ShipmentId-1',
            baseUrl: 'http://example.com/footprints.csv',
          },
        };
        await expect(validateDataModel.execute(validInput)).to.be.rejectedWith(
          EmptyDataSource
        );
        mockDataSourceFetcher.fetchFootprintData.should.have.been.calledOnceWithExactly(
          validInput
        );
      });

      it('should pass when data model validation is satisfied', async () => {
        mockDataSourceFetcher.fetchFootprintData.returns(
          Promise.resolve(
            JSON.stringify([validDataModel, validDataModel, validDataModel])
          )
        );

        const validInput = {
          ...mockInput,
          type: 'http' as const,
          month: 12,
          year: 2023,
          dataLocation: {
            name: 'ShipmentId-1',
            baseUrl: 'http://example.com/footprints.csv',
          },
        };
        await expect(
          validateDataModel.execute(validInput)
        ).to.not.be.rejectedWith(DataModelValidationFailed);
        mockDataSourceFetcher.fetchFootprintData.should.have.been.calledOnceWithExactly(
          validInput
        );
      });

      it('should fail when some required fields are missing', async () => {
        mockDataSourceFetcher.fetchFootprintData.returns(
          Promise.resolve(JSON.stringify([{}, {}, {}]))
        );

        const validInput = {
          ...mockInput,
          type: 'http' as const,
          month: 12,
          year: 2023,
          dataLocation: {
            name: 'ShipmentId-1',
            baseUrl: 'http://example.com/footprints.csv',
          },
        };
        const { errors } = await expect(
          validateDataModel.execute(validInput)
        ).to.be.rejectedWith(DataModelValidationFailed);

        errors.should.be.eql({
          Feedstock_N: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          distance_activity: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          empty_distance_factor: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          energy_carrier_feedstock_N: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          id_tce_order: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          loading_city: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          loading_country: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          temp_control: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          transport_operator_name: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          unloading_city: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          unloading_country: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          unloading_date: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          loading_date: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          verification: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          co2e_intensity_wtw_unit: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          co2e_intensity_wtw: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          energy_carrier_N: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          id_consignment: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          id_shipment: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          id_tce: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          load_factor: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          mass: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          mode_of_transport: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          transport_activity: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
        });
        mockDataSourceFetcher.fetchFootprintData.should.have.been.calledOnceWithExactly(
          validInput
        );
      });

      it('all the values of unloading_date should be in the same month', async () => {
        mockDataSourceFetcher.fetchFootprintData.returns(
          Promise.resolve(
            JSON.stringify([
              {
                ...validDataModel,
                unloading_date: '2024-01-01',
              },
              {
                ...validDataModel,
                unloading_date: '2023-11-01',
              },
              {
                ...validDataModel,
                unloading_date: '2023-12-25',
              },
              {
                ...validDataModel,
                unloading_date: '2023-12-03',
              },
              {
                ...validDataModel,
                unloading_date: '2023-12-31T13:00:00.000Z',
              },
            ])
          )
        );

        const validInput = {
          ...mockInput,
          type: 'http' as const,
          month: 12,
          year: 2023,
          dataLocation: {
            name: 'ShipmentId-1',
            baseUrl: 'http://example.com/footprints.csv',
          },
        };
        const { errors } = await expect(
          validateDataModel.execute(validInput)
        ).to.be.rejectedWith(DataModelValidationFailed);

        errors.should.be.eql({
          unloading_date: {
            msgs: [
              'must be less than or equal to "2023-12-31T23:59:59.999Z"',
              'must be greater than or equal to "2023-12-01T00:00:00.000Z"',
            ],
            rows: [1, 2],
          },
        });
        mockDataSourceFetcher.fetchFootprintData.should.have.been.calledOnceWithExactly(
          validInput
        );
      });

      it('should throw an error when unloading_country or loading_country is not a valid iso country code', async () => {
        mockDataSourceFetcher.fetchFootprintData.returns(
          Promise.resolve(
            JSON.stringify([
              {
                ...validDataModel,
                unloading_country: 'UNKB',
                loading_country: 'UK',
              },
              {
                ...validDataModel,
                unloading_country: 'KRQ',
                loading_country: 'BM',
              },
            ])
          )
        );

        const validInput = {
          ...mockInput,
          type: 'http' as const,
          month: 12,
          year: 2023,
          dataLocation: {
            name: 'ShipmentId-1',
            baseUrl: 'http://example.com/footprints.csv',
          },
        };
        const { errors } = await expect(
          validateDataModel.execute(validInput)
        ).to.be.rejectedWith(DataModelValidationFailed);

        errors.should.be.eql({
          unloading_country: {
            msgs: [
              'length must be less than or equal to 3 characters long',
              'must be a valid iso2 or iso3 country code',
            ],
            rows: [1, 1, 2],
          },
          loading_country: {
            msgs: ['must be a valid iso2 or iso3 country code'],
            rows: [1],
          },
        });
        mockDataSourceFetcher.fetchFootprintData.should.have.been.calledOnceWithExactly(
          validInput
        );
      });

      it('should throw an error if unloading_date is before loading_date', async () => {
        mockDataSourceFetcher.fetchFootprintData.returns(
          Promise.resolve(
            JSON.stringify([
              {
                ...validDataModel,
                unloading_date: '2023-11-01',
                loading_date: '2024-02-01',
              },
              {
                ...validDataModel,
                unloading_date: '2023-11-01',
                loading_date: '2023-10-01',
              },
            ])
          )
        );

        const validInput = {
          ...mockInput,
          type: 'http' as const,
          month: 11,
          year: 2023,
          dataLocation: {
            name: 'ShipmentId-1',
            baseUrl: 'http://example.com/footprints.csv',
          },
        };
        const { errors } = await expect(
          validateDataModel.execute(validInput)
        ).to.be.rejectedWith(DataModelValidationFailed);

        errors.should.be.eql({
          loading_date: {
            msgs: ['must be less than or equal to "ref:unloading_date"'],
            rows: [1],
          },
        });
        mockDataSourceFetcher.fetchFootprintData.should.have.been.calledOnceWithExactly(
          validInput
        );
      });

      it('should not throw an error when only one of the optional rows is null', async () => {
        mockDataSourceFetcher.fetchFootprintData.returns(
          Promise.resolve(
            JSON.stringify([
              { ...validDataModel, WTW_fuel_emission_factor: 43 },
            ])
          )
        );

        const validInput = {
          ...mockInput,
          type: 'http' as const,
          month: 12,
          year: 2023,
          dataLocation: {
            name: 'ShipmentId-1',
            baseUrl: 'http://example.com/footprints.csv',
          },
        };
        await expect(
          validateDataModel.execute(validInput)
        ).to.not.be.rejectedWith(DataModelValidationFailed);

        mockDataSourceFetcher.fetchFootprintData.should.have.been.calledOnceWithExactly(
          validInput
        );
      });
      it('should fail when empty_distance_factor is equal to 0', async () => {
        mockDataSourceFetcher.fetchFootprintData.returns(
          Promise.resolve(
            JSON.stringify([{ ...validDataModel, empty_distance_factor: 0 }])
          )
        );

        const validInput = {
          ...mockInput,
          type: 'http' as const,
          month: 12,
          year: 2023,
          dataLocation: {
            name: 'ShipmentId-1',
            baseUrl: 'http://example.com/footprints.csv',
          },
        };
        const { errors } = await expect(
          validateDataModel.execute(validInput)
        ).to.be.rejectedWith(DataModelValidationFailed);

        errors.should.be.eql({
          empty_distance_factor: {
            msgs: ['must be greater than 0'],
            rows: [1],
          },
        });
        mockDataSourceFetcher.fetchFootprintData.should.have.been.calledOnceWithExactly(
          validInput
        );
      });
    });
  });
});
