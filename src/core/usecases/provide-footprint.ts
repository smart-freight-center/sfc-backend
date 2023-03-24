import { EdcAdapter } from '../clients/EdcClient';
import { ShareFootprintInput } from '../entities';
import * as builder from '../../utils/edc-builder';
export class ProvideFootprintUsecase {
  constructor(private edcClient: EdcAdapter) {}

  async share(data: ShareFootprintInput) {
    const results: Array<{
      step: string;
      result: CreateResult;
      rollBackFuncName: string;
    }> = [];
    try {
      const assetInput = builder.assetInput(data);
      const assetCreationResult = await this.edcClient.createAsset(assetInput);
      results.push({
        step: 'assetCreation',
        result: assetCreationResult,
        rollBackFuncName: 'deleteAsset',
      });

      const policyInput = builder.policyInput(assetCreationResult.id);
      const policyCreationResult = await this.edcClient.createPolicy(
        policyInput
      );
      results.push({
        step: 'policyCreation',
        result: policyCreationResult,
        rollBackFuncName: 'deletePolicy',
      });

      const contractDefinitionInput = builder.contractDefinition({
        accessPolicyId: policyCreationResult.id,
        contractPolicyId: policyCreationResult.id,
      });
      const contractCreationResult =
        await this.edcClient.createContractDefinitions(contractDefinitionInput);
      results.push({
        step: 'contractCreation',
        result: contractCreationResult,
        rollBackFuncName: 'deleteContractDefinition',
      });

      return {
        body: assetCreationResult,
      };
    } catch (error) {
      results.forEach(async (step) => {
        if (step.result.id) {
          await this.edcClient[step.rollBackFuncName](step.result.id);
          results.splice(results.indexOf(step), 1);
        }
      });
      return;
    }
  }

  async list() {
    const assets = await this.edcClient.listAssets();
    return {
      body: assets,
    };
  }
}
