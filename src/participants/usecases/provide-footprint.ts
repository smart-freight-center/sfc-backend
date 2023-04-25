import { ShareFootprintInput } from 'entities';
import { EdcAdapter } from '../clients/edc-client';
import * as builder from 'participants/utils/edc-builder';
import { validateSchema, isValidDateFormat } from 'utils/helpers';
import {
  customMessage,
  shareFootprintSchema,
} from 'participants/validators/share-footprint-schema';

export class ProvideFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  public async share(data: ShareFootprintInput) {
    this.validateData(data);
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
  private validateData(input: ShareFootprintInput) {
    input.type = input.type.toLowerCase() as ShareFootprintInput['type'];
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
    const startDate = input.trackingPeriod.split('-')[0];
    const endDate = input.trackingPeriod.split('-')[1];

    isValidDateFormat(startDate);
    isValidDateFormat(endDate);
  }

  private async rollback(results) {
    if (results.newId) {
      this.edcClient.deleteAsset(results.newAssetId);
    }
    if (results.newPolicyId) {
      this.edcClient.deletePolicy(results.newAssetId);
    }

    if (results.newContractId) {
      this.edcClient.deleteContractDefinition(results.newAssetId);
    }
  }

  async list() {
    const assets = await this.edcClient.listAssets();

    return assets.map((asset) => ({
      createdAt: asset.createdAt,
      id: asset.id,
      name: asset.properties['asset:prop:name'],
    }));
  }
}
