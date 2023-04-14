import { ShareFootprintInput } from 'entities';
import { EdcAdapter } from '../clients/edc-client';
import * as builder from 'participants/utils/edc-builder';

export class ProvideFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async share(data: ShareFootprintInput) {
    const results = {
      newAssetId: '',
      newPolicyId: '',
      newContractId: '',
    };

    try {
      const assetInput = builder.assetInput(data);
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
      console.log(error);
      await this.rollback(results);
      return;
    }
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
