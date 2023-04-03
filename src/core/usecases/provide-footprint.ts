import { EdcAdapter } from '../clients/EdcClient';
import { ShareFootprintInput } from '../entities';
import * as builder from '../../utils/edc-builder';
export class ProvideFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async share(data: ShareFootprintInput) {
    const assetInput = builder.assetInput(data);
    const assetCreationResult = await this.edcClient.createAsset(assetInput);
    const policyInput = builder.policyInput(assetCreationResult.id);
    const policyCreationResult = await this.edcClient.createPolicy(policyInput);
    const contractDefinitionInput = builder.contractDefinition({
      accessPolicyId: policyCreationResult.id,
      contractPolicyId: policyCreationResult.id,
    });
    await this.edcClient.createContractDefinitions(contractDefinitionInput);

    return {
      body: assetCreationResult,
    };
  }

  async list() {
    const assets = await this.edcClient.listAssets();
    return {
      body: assets,
    };
  }
}
