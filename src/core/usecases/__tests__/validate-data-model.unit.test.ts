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
          accreditation: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          actual_distance: {
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
          co2_wtw: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
        });
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

      it('should throw an error if one or more element in the json array does not pass data model validation', async () => {
        mockDataSourceFetcher.fetchFootprintData.returns(
          Promise.resolve(
            JSON.stringify([
              {
                id_tce: 'tce_1',
                id_consignment: '1050700',
                id_shipment: 'shipmentid1',
                transport_activity: '400',
                mass: '1000',
                mode_of_transport: 'Road',
                asset_type: '40-ft truck',
                load_factor: '0.8',
                empty_distance: '50',
                energy_carrier_N: '<some string here>',
                Feedstock_N: 'biodiesel',
                actual_distance: '100',
                co2_wtw: '10',
              },
              {
                id_tce: 'tce_2',
                id_consignment: '2008750',
                id_shipment: 'shipmentid1',
                transport_activity: '300',
                mass: '1000',
                mode_of_transport: 'Ocean',
                asset_type: 'container ship X',
                load_factor: '0.7',
                empty_distance: '0',
                energy_carrier_N: '<some string here>',
                Feedstock_N: 'marine oil',
                actual_distance: '200',
              },
              {
                id_tce: 'tce_3',
                id_consignment: '3006756',
                id_shipment: 'shipmentid1',
                transport_activity: '200',
                mass: '1000',
                mode_of_transport: 'Air',
                asset_type: 'Airplane XYZ',
                load_factor: '0.3',
                empty_distance: '10',
                energy_carrier_N: '<some string here>',
                Feedstock_N: 'aviation fuel blend',
                actual_distance: '300',
                unloading_date: '2023-12-25',
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
          accreditation: {
            msgs: ['is required'],
            rows: [1, 2, 3],
          },
          co2_wtw: {
            msgs: ['is required'],
            rows: [2, 3],
          },
          unloading_date: {
            msgs: ['is required'],
            rows: [1, 2],
          },
          verification: {
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
                id_tce: 'tce_1',
                id_consignment: '1050700',
                id_shipment: 'shipmentid1',
                transport_activity: '400',
                mass: '1000',
                mode_of_transport: 'Road',
                asset_type: '40-ft truck',
                load_factor: '0.8',
                empty_distance: '50',
                energy_carrier_N: '<some string here>',
                Feedstock_N: 'biodiesel',
                actual_distance: '100',
                unloading_date: '2024-01-01',
                accreditation: false,
                verification: false,
                co2_wtw: 42,
              },
              {
                id_tce: 'tce_2',
                id_consignment: '2008750',
                id_shipment: 'shipmentid1',
                transport_activity: '300',
                mass: '1000',
                mode_of_transport: 'Ocean',
                asset_type: 'container ship X',
                load_factor: '0.7',
                empty_distance: '0',
                energy_carrier_N: '<some string here>',
                Feedstock_N: 'marine oil',
                actual_distance: '200',
                accreditation: false,
                verification: false,
                co2_wtw: 42,
                unloading_date: '2023-11-01',
              },
              {
                id_tce: 'tce_3',
                id_consignment: '3006756',
                id_shipment: 'shipmentid1',
                transport_activity: '200',
                mass: '1000',
                mode_of_transport: 'Air',
                asset_type: 'Airplane XYZ',
                load_factor: '0.3',
                empty_distance: '10',
                energy_carrier_N: '<some string here>',
                Feedstock_N: 'aviation fuel blend',
                actual_distance: '300',
                accreditation: false,
                verification: false,
                co2_wtw: 42,
                unloading_date: '2023-12-25',
              },
              {
                id_tce: 'tce_3',
                id_consignment: '3006756',
                id_shipment: 'shipmentid1',
                transport_activity: '200',
                mass: '1000',
                mode_of_transport: 'Air',
                asset_type: 'Airplane XYZ',
                load_factor: '0.3',
                empty_distance: '10',
                energy_carrier_N: '<some string here>',
                Feedstock_N: 'aviation fuel blend',
                actual_distance: '300',
                accreditation: false,
                verification: false,
                co2_wtw: 42,
                unloading_date: '2023-12-03',
              },
              {
                id_tce: 'tce_3',
                id_consignment: '3006756',
                id_shipment: 'shipmentid1',
                transport_activity: '200',
                mass: '1000',
                mode_of_transport: 'Air',
                asset_type: 'Airplane XYZ',
                load_factor: '0.3',
                empty_distance: '10',
                energy_carrier_N: '<some string here>',
                Feedstock_N: 'aviation fuel blend',
                actual_distance: '300',
                accreditation: false,
                verification: false,
                co2_wtw: 42,
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
    });
  });
});
