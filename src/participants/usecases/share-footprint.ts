import { ShareFootprintInput } from 'entities';

import { EdcAdapter } from '../clients/edc-client';
import * as builder from 'participants/utils/edc-builder';
import { validateSchema } from 'utils/helpers';
import {
  customMessage,
  shareFootprintSchema,
} from 'participants/validators/share-footprint-schema';

import { InvalidFootprintData, ParticipantNotFound } from 'utils/error';
import { convertRawDataToJSON } from 'participants/utils/data-converter';
import { DataSourceServiceType, SFCAPI } from 'participants/clients';
import { SFCAPIType } from 'participants/types';

export class ShareFootprintUsecase {
  constructor(
    private edcClient: EdcAdapter,
    private dataSourceService: DataSourceServiceType,
    private sfcAPI: SFCAPIType
  ) {}

  public async execute(authorization: string, input: ShareFootprintInput) {
    this.validateDataSchema(input);
    const rawData = await this.dataSourceService.fetchFootprintData(input);

    await this.verifyDataModel(rawData);
    await this.shareAsset(authorization, input);
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

  private async shareAsset(authorization: string, data: ShareFootprintInput) {
    const results = {
      newAssetId: '',
      newPolicyId: '',
      newContractId: '',
    };

    try {
      console.log("getting provider...")
      const provider = await this.getProvider(authorization, data.companyId);
      console.log("got provider : ", provider)
      const assetInput = builder.assetInput(data);
      console.log("asset input :", assetInput) 
      const newAsset = await this.edcClient.createAsset(assetInput);
      console.log(newAsset)
      results.newAssetId = newAsset.id;
      const policyInput = builder.policyInput(provider.company_BNP);
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

  private async getProvider(authorization: string, clientId: string) {
    const sfcConnection = await this.sfcAPI.createConnection(
      authorization || ''
    );
    const provider = await sfcConnection.getCompany(clientId);
    return provider;
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
