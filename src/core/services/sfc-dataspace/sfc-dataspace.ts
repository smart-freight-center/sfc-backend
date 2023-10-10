import * as builder from 'core/utils/edc-builder';

import { ISfcDataSpace } from 'core/usecases/interfaces';
import { ContractDefinition, ShareFootprintInput } from 'entities';
import { convertRawDataToJSON } from 'core/utils/data-converter';
import { Participant } from 'core/types';
import { ContractNotFound, ShipmentAlreadyShared } from 'utils/errors';
import { EdcTransferService } from './edc-transfer-service';
import { IEdcClient } from './interfaces';

export class SfcDataSpace implements ISfcDataSpace {
  constructor(private edcClient: IEdcClient) {}

  public async startTransferProcess(provider, contractOffer) {
    const edcTransferService = new EdcTransferService(this.edcClient);
    await edcTransferService.initiateTransferProcess(provider, contractOffer);
  }

  public async unshareFootprint(shipmentId: string, companyId: string) {
    const contracts = await this.getContractDefintions(shipmentId, companyId);
    if (!contracts?.length) {
      throw new ContractNotFound();
    }
    await this.deleteContractOffers(contracts);
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

  async shareAsset(
    provider: Participant,
    consumer: Participant,
    data: ShareFootprintInput
  ) {
    await this.ensureShipmentHasNotBeenShared(
      data.shipmentId,
      consumer.client_id
    );
    const results = {
      newAssetId: '',
      newPolicyId: '',
      newContractId: '',
    };
    try {
      const assetInput = builder.assetInput(
        data,
        provider.client_id,
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

  private async ensureShipmentHasNotBeenShared(
    shipmentId: string,
    sharedWith: string
  ) {
    const assetId = `${shipmentId}-${sharedWith}`;
    const filter = builder.shipmentFilter('id', `${assetId}%`, 'LIKE');
    const contracts = await this.edcClient.queryAllContractDefinitions(filter);

    if (contracts.length) throw new ShipmentAlreadyShared();
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
