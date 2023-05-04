import { ShareFootprintInput } from 'entities';

import { EdcAdapter } from '../clients/edc-client';
import * as builder from 'participants/utils/edc-builder';
import { validateSchema } from 'utils/helpers';
import {
  customMessage,
  shareFootprintSchema,
} from 'participants/validators/share-footprint-schema';

import { InvalidFootprintData } from 'utils/error';
import { convertRawDataToJSON } from 'participants/utils/data-converter';
import { DataSourceServiceType } from 'participants/clients';

export class ShareFootprintUsecase {
  constructor(
    private edcClient: EdcAdapter,
    private dataSourceService: DataSourceServiceType
  ) {}

  public async execute(input: ShareFootprintInput) {
    this.validateDataSchema(input);
    const rawData = await this.dataSourceService.fetchFootprintData(input);

    await this.verifyDataModel(rawData);
    await this.createAsset(input);
  }

  private validateDataSchema(input: Partial<ShareFootprintInput>) {
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

  private async createAsset(data: ShareFootprintInput) {
    const results = {
      newAssetId: '',
      newPolicyId: '',
      newContractId: '',
    };

    try {
      const assetInput = builder.assetInput(data, this.edcClient.edcClientId);
      const newAsset = await this.edcClient.createAsset(assetInput);
      results.newAssetId = newAsset.id;

      const policyInput = builder.policyInput(newAsset.id);
      const newPolicy = await this.edcClient.createPolicy(policyInput);
      results.newPolicyId = newPolicy.id;

      const contractDefinitionInput = builder.contractDefinition({
        accessPolicyId: newPolicy.id,
        contractPolicyId: newPolicy.id,
      });
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
