import { ShareFootprintInput } from 'entities';

import { EdcAdapter } from '../clients/edc-client';
import * as builder from 'participants/utils/edc-builder';
import { validateSchema } from 'utils/helpers';
import {
  customMessage,
  shareFootprintSchema,
} from 'participants/validators/share-footprint-schema';

import {
  InvalidFootprintData,
  InvalidShipmentIdFormat,
  ShipmentAlreadyShared,
} from 'utils/error';
import { convertRawDataToJSON } from 'participants/utils/data-converter';
import { DataSourceServiceType } from 'participants/clients';
import { SFCAPIType } from 'participants/types';

export class ShareFootprintUsecase {
  constructor(
    private edcClient: EdcAdapter,
    private dataSourceService: DataSourceServiceType,
    private sfcAPI: SFCAPIType
  ) {}

  public async execute(authorization: string, input: ShareFootprintInput) {
    this.validateDataSchema(input);
    await this.ensureShipmentHasNotBeenCreated(input.shipmentId);
    const rawData = await this.dataSourceService.fetchFootprintData(input);

    await this.verifyDataModel(rawData);
    await this.shareAsset(authorization, input);
  }

  private validateDataSchema(input: Partial<ShareFootprintInput>) {
    const regex = /^[a-zA-Z!@#$%^&*()+={}[\]|\\;"'<>,.?/~`]+$/;
    if (!regex.test(input.shipmentId as string)) {
      throw new InvalidShipmentIdFormat();
    }
    input.type = input.type?.toLowerCase() as ShareFootprintInput['type'];
    validateSchema(input, shareFootprintSchema.shared, customMessage.shared);
    if (input.type === 'azure') {
      validateSchema(input, shareFootprintSchema.azure);
    }
    if (input.type === 's3') {
      validateSchema(input, shareFootprintSchema.s3);
    }
    if (input.type === 'http') {
      validateSchema(input, shareFootprintSchema.http);
    }
  }

  private async verifyDataModel(rawData: string) {
    const jsonData = convertRawDataToJSON(rawData);

    const { error, value } = shareFootprintSchema.dataModel.validate(jsonData, {
      abortEarly: false,
    });

    if (!error?.details) return value;

    throw new InvalidFootprintData(error);
  }

  private async ensureShipmentHasNotBeenCreated(shipmentId: string) {
    const offers = await this.getShipmentOffers(shipmentId);

    if (offers.length) throw new ShipmentAlreadyShared();
    return offers;
  }

  private async getShipmentOffers(shipmentId: string) {
    const assetFilter = builder.shipmentFilter('id', `${shipmentId}-%`, 'LIKE');
    const contractOffers = await this.edcClient.queryAllContractDefinitions(
      assetFilter
    );
    return contractOffers.filter((offer) => offer.id.startsWith(shipmentId));
  }
  private async shareAsset(authorization: string, data: ShareFootprintInput) {
    const results = {
      newAssetId: '',
      newPolicyId: '',
      newContractId: '',
    };

    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );
    const consumer = await sfcConnection.getCompany(data.companyId);
    const myProfile = await sfcConnection.getMyProfile();

    try {
      const assetInput = builder.assetInput(
        data,
        myProfile.client_id,
        consumer.client_id
      );

      const newAsset = await this.edcClient.createAsset(assetInput);
      results.newAssetId = newAsset.id;

      const policyInput = builder.policyInput(consumer.company_BNP);
      const newPolicy = await this.edcClient.createPolicy(policyInput);
      results.newPolicyId = newPolicy.id;

      const contractDefinitionInput = builder.contractDefinition(
        newAsset.id,
        newPolicy.id
      );
      const newContract = await this.edcClient.createContractDefinitions(
        contractDefinitionInput
      );
      results.newContractId = newContract.id;
      return newAsset;
    } catch (error) {
      await this.rollback(results);
      throw error;
    }
  }

  private async rollback(results) {
    if (results.newId) {
      this.edcClient.deleteAsset(results.newAssetId);
    }
    if (results.newPolicyId) {
      this.edcClient.deletePolicy(results.newPolicyId);
    }

    if (results.newContractId) {
      this.edcClient.deleteContractDefinition(results.newContractId);
    }
  }
}
