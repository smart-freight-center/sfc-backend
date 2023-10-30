import * as builder from 'utils/edc-builder';

import {
  DeleteAssetInput,
  FootprintMetaData,
  ISfcDataSpace,
  ShareDataspaceAssetInput,
  SingleAssetDetail,
} from 'core/usecases/interfaces';
import { ContractDefinition } from 'entities';
import { convertRawDataToJSON } from 'utils/data-converter';
import { ShipmentAlreadyShared, ShipmentForMonthNotFound } from 'utils/errors';
import { EdcTransferService } from './edc-transfer-service';
import { IEdcClient } from './interfaces';
import { Participant } from 'core/types';
import { Offer } from '@think-it-labs/edc-connector-client';
import { AppLogger } from 'utils/logger';

const logger = new AppLogger('SfcDataSpace');
export class SfcDataSpace implements ISfcDataSpace {
  constructor(private edcClient: IEdcClient) {}

  public async startTransferProcess(singleAssetDetail: SingleAssetDetail) {
    const edcTransferService = new EdcTransferService(this.edcClient);
    await edcTransferService.initiateTransferProcess(singleAssetDetail);
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

  public async fetchDataThatProviderHasShared(providerUrl: string) {
    const catalog = await this.edcClient.listCatalog({
      providerUrl,
    });

    return catalog.datasets.map((dataset) => {
      const footprintItem: FootprintMetaData = {
        owner: dataset.mandatoryValue('edc', 'owner'),
        month: dataset.mandatoryValue('edc', 'month'),
        sharedWith: dataset.mandatoryValue('edc', 'sharedWith'),
        numberOfRows: dataset.mandatoryValue('edc', 'numberOfRows'),
        year: dataset.mandatoryValue('edc', 'year'),
        id: dataset.mandatoryValue('edc', 'id'),
      };
      return footprintItem;
    });
  }

  public async fetchAssetsByMonth(
    connections: Omit<Participant, 'connection'>[],
    filters
  ) {
    logger.info('Fetching Assets by month...', filters);
    const footprintDataPromises: Promise<FootprintMetaData[]>[] = [];
    for (let index = 0; index < connections.length; index++) {
      const connection = connections[index];
      const protocol = connection.connector_data.addresses.protocol as string;
      const dataPromise = this.retrieveCatalogByMonth(protocol, filters);
      footprintDataPromises.push(dataPromise);
    }

    const providerFootprintData = await Promise.all(footprintDataPromises);

    const assetDetails: SingleAssetDetail[] = [];

    for (let index = 0; index < providerFootprintData.length; index++) {
      for (const footprintData of providerFootprintData[index]) {
        assetDetails.push({
          provider: connections[index],
          assetId: footprintData.id,
          contractOffer: footprintData.offer as Offer,
        });
      }
    }

    return assetDetails;
  }

  private async retrieveCatalogByMonth(providerUrl: string, filters) {
    const catalog = await this.edcClient.listCatalog({
      providerUrl,
      querySpec: {
        filterExpression: [
          builder.assetFilter('month', '=', filters.month),
          builder.assetFilter('year', '=', filters.year),
        ],
      },
    });

    return catalog.datasets.map((dataset) => {
      const footprintItem: FootprintMetaData = {
        owner: dataset.mandatoryValue('edc', 'owner'),
        month: dataset.mandatoryValue('edc', 'month'),
        sharedWith: dataset.mandatoryValue('edc', 'sharedWith'),
        numberOfRows: dataset.mandatoryValue('edc', 'numberOfRows'),
        year: dataset.mandatoryValue('edc', 'year'),
        id: dataset.mandatoryValue('edc', 'id'),
        offer: dataset.offers[0],
      };
      return footprintItem;
    });
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
