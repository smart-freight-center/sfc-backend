import { EdcAdapter } from '../clients/EdcClient';
import { ShareFootprintInput } from '../entities';
import * as builder from '../../utils/edc-builder';
export class ProvideFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async share(data: ShareFootprintInput) {
    const assetInput = builder.assetInput(data);
    const asset = await this.edcClient.createAsset(assetInput);
    const policyInput = builder.policyInput(asset.id);
    const policy = await this.edcClient.createPolicy(policyInput);
    const contractDefinitionInput = builder.contractDefinition({
      accessPolicyId: policy.id,
      contractPolicyId: policy.id,
    });
    await this.edcClient.createContractDefinitions(contractDefinitionInput);

    return {
      body: asset,
    };
  }

  async list() {
    const assets = await this.edcClient.listAssets();
    return {
      body: assets,
    };
  }
}