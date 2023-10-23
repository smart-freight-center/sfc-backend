import * as builder from 'utils/edc-builder';

import {
  DeleteAssetInput,
  FootprintMetaData,
  ISfcDataSpace,
  ShareDataspaceAssetInput,
} from 'core/usecases/interfaces';
import { ContractDefinition } from 'entities';
import { convertRawDataToJSON } from 'utils/data-converter';
import { ShipmentAlreadyShared, ShipmentForMonthNotFound } from 'utils/errors';
import { EdcTransferService } from './edc-transfer-service';
import { IEdcClient } from './interfaces';
import { Participant } from 'core/types';

export class SfcDataSpace implements ISfcDataSpace {
  constructor(private edcClient: IEdcClient) {}

  public async startTransferProcess(provider, contractOffer) {
    const edcTransferService = new EdcTransferService(this.edcClient);
    await edcTransferService.initiateTransferProcess(provider, contractOffer);
  }

  public async fetchFootprintsMetaData(
    provider: Participant
  ): Promise<FootprintMetaData[]> {
    const assets = await this.edcClient.listAssets({
      filterExpression: [builder.assetFilter('owner', '=', provider.client_id)],
    });

    return assets.map((asset) => ({
      owner: asset.properties.mandatoryValue('edc', 'owner'),
      numberOfRows: asset.properties.mandatoryValue('edc', 'numberOfRows'),
      month: asset.properties.mandatoryValue('edc', 'month'),
      sharedWith: asset.properties.mandatoryValue('edc', 'sharedWith'),
      year: asset.properties.mandatoryValue('edc', 'year'),
      id: asset.properties.mandatoryValue('edc', 'id'),
    }));
  }

  public async unshareFootprint(
    providerId: string,
    assetToDelete: DeleteAssetInput
  ) {
    const assets = await this.edcClient.listAssets({
      filterExpression: [
        builder.assetFilter('owner', '=', providerId),
        builder.assetFilter('sharedWith', '=', assetToDelete.companyId),
        builder.assetFilter('month', '=', assetToDelete.month),
        builder.assetFilter('year', '=', assetToDelete.year),
      ],
    });

    if (!assets?.length) throw new ShipmentForMonthNotFound();

    for (const asset of assets) {
      await this.edcClient.deleteAsset(asset['@id']);
    }
  }

  public async fetchCarbonFootprint(input) {
    const response = await this.edcClient.getTranferedData(input);

    if (response.body) {
      const textData = await response.text();
      return convertRawDataToJSON(textData);
    }
  }

  private async getContractDefintions(shipmentId: string, companyId: string) {
    const assetId = companyId ? `${shipmentId}-${companyId}` : shipmentId;
    const filter = builder.shipmentFilter('id', `${assetId}%`, 'LIKE');
    const contracts = await this.edcClient.queryAllContractDefinitions(filter);
    return contracts.filter((contract) => contract.id.startsWith(assetId));
  }

  private async deleteContractOffers(contracts: ContractDefinition[]) {
    for (const contract of contracts) {
      await this.edcClient.deleteContractDefinition(contract.id);
    }
  }

  async shareAsset(input: ShareDataspaceAssetInput) {
    const { consumer, provider, numberOfRows, ...data } = input;
    await this.ensureFootprintHasNotBeenShared(input, consumer.client_id);
    const results = {
      newAssetId: '',
      newPolicyId: '',
      newContractId: '',
    };
    try {
      const assetInput = builder.assetInput({
        ...data,
        providerClientId: provider.client_id,
        sharedWith: consumer.client_id,
        numberOfRows,
      });

      const newAsset = await this.edcClient.createAsset(assetInput);
      results.newAssetId = newAsset.id;

      const policyInput = builder.policyInput(consumer.company_BNP);
      const newPolicy = await this.edcClient.createPolicy(policyInput);
      results.newPolicyId = newPolicy.id;

      const assetSelectorForContract = [
        builder.assetFilter('owner', '=', assetInput.properties.owner),
        builder.assetFilter('month', '=', assetInput.properties.month),
        builder.assetFilter('year', '=', assetInput.properties.year),
        builder.assetFilter('sharedWith', '=', consumer.client_id),
      ];

      const contractDefinitionInput = builder.contractDefinition(
        newAsset.id,
        newPolicy.id,
        assetSelectorForContract
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

  private async ensureFootprintHasNotBeenShared(
    input: ShareDataspaceAssetInput,
    sharedWith: string
  ) {
    const assets = await this.edcClient.listAssets({
      filterExpression: [
        builder.assetFilter('sharedWith', '=', sharedWith),
        builder.assetFilter('year', '=', input.year),
        builder.assetFilter('month', '=', input.month),
      ],
    });

    if (assets.length) throw new ShipmentAlreadyShared();
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
