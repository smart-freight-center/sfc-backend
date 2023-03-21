import { EdcAdapter } from '../../core/clients/EdcClient';
import { ShareFootprintInput } from '../../core/entities';
import * as builder from '../../utils/edc-builder';
export class ShareFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async share(data: ShareFootprintInput) {
    const assetInput = builder.assetInput(data);
    const asset = await this.edcClient.createAsset(assetInput);
    const policyInput = builder.policyInput();
    const policy = await this.edcClient.createPolicy(policyInput);
    const contractDefinitionInput = builder.contractDefinition({
      accessPolicyId: policy.id,
      contractPolicyId: policy.id,
    });
    await this.edcClient.createContractDefinitions(contractDefinitionInput);

    return {
      status: 201,
      body: asset,
    };
  }

  async list() {
    const assets = await this.edcClient.listAssets();
    return {
      status: 200,
      body: assets,
    };
  }
}
