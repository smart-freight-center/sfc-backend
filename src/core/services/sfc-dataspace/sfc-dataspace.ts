import * as builder from 'utils/edc-builder';

import {
  DeleteAssetInput,
  FootprintMetaData,
  ISfcDataSpace,
  MonthFilter,
  ShareDataspaceAssetInput,
  SingleAssetDetail,
} from 'core/usecases/interfaces';
import { convertRawDataToJSON } from 'utils/data-converter';
import { ShipmentAlreadyShared, ShipmentForMonthNotFound } from 'utils/errors';
import { EdcTransferService } from './edc-transfer-service';
import { IEdcClient } from './interfaces';
import { Participant } from 'core/types';
import { CriterionInput, Offer } from '@think-it-labs/edc-connector-client';
import { AppLogger } from 'utils/logger';

const logger = new AppLogger('SfcDataSpace');
export class SfcDataSpace implements ISfcDataSpace {
  constructor(private edcClient: IEdcClient) {}

  public async startTransferProcess(singleAssetDetail: SingleAssetDetail) {
    const edcTransferService = new EdcTransferService(this.edcClient);
    await edcTransferService.initiateTransferProcess(singleAssetDetail);
  }

  public async fetchSharedFootprintsMetaData(
    ownerId: string
  ): Promise<FootprintMetaData[]> {
    const assets = await this.edcClient.listAssets({
      filterExpression: [builder.assetFilter('owner', '=', ownerId)],
    });

    const contractDefinitions =
      await this.edcClient.queryAllContractDefinitions({
        filterExpression: [
          ...builder.contractDefinitionFilter('owner', '=', ownerId),
        ],
      });

    const assetIds = new Set(contractDefinitions.map((item) => item['@id']));

    return assets
      .filter((asset) => assetIds.has(asset['@id']))
      .map((asset) => ({
        owner: asset.properties.mandatoryValue('edc', 'owner'),
        numberOfRows: asset.properties.mandatoryValue('edc', 'numberOfRows'),
        month: asset.properties.mandatoryValue('edc', 'month'),
        sharedWith: asset.properties.mandatoryValue('edc', 'sharedWith'),
        year: asset.properties.mandatoryValue('edc', 'year'),
        id: asset.properties.mandatoryValue('edc', 'id'),
      }));
  }

  public async fetchReceivedAssets(
    connections: Omit<Participant, 'connection'>[],
    currentParticipantClientId: string,
    filters?: MonthFilter
  ) {
    logger.info('Fetching Assets by month...', filters);
    const footprintDataPromises: Promise<FootprintMetaData[]>[] = [];
    for (let index = 0; index < connections.length; index++) {
      const connection = connections[index];
      const protocol = connection.connector_data.addresses.protocol as string;
      const dataPromise = this.retrieveCatalogByMonth(
        protocol,
        currentParticipantClientId,
        filters
      );
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
          footprintData: footprintData,
        });
      }
    }

    return assetDetails;
  }

  private async retrieveCatalogByMonth(
    providerUrl: string,
    currentParticipantClientId: string,
    filters?: MonthFilter
  ) {
    const filterExpression: CriterionInput[] = [
      builder.assetFilter('sharedWith', '=', currentParticipantClientId),
    ];
    if (filters?.month) {
      filterExpression.push(builder.assetFilter('month', '=', filters.month));
    }
    if (filters?.year) {
      filterExpression.push(builder.assetFilter('year', '=', filters.year));
    }

    const catalog = await this.edcClient.listCatalog({
      providerUrl,
      querySpec: {
        filterExpression: filterExpression,
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
    const { companyId, month, year } = assetToDelete;
    const contractDefinitions =
      await this.edcClient.queryAllContractDefinitions({
        filterExpression: [
          ...builder.contractDefinitionFilter('owner', '=', providerId),
          ...builder.contractDefinitionFilter('sharedWith', '=', companyId),
          ...builder.contractDefinitionFilter('month', '=', month),
          ...builder.contractDefinitionFilter('year', '=', year),
        ],
      });

    if (!contractDefinitions?.length) throw new ShipmentForMonthNotFound();

    for (const contractDefinition of contractDefinitions) {
      await this.edcClient.deleteContractDefinition(contractDefinition.id);
    }
  }

  public async fetchCarbonFootprint(authKey: string, authCode: string) {
    logger.info('Fetching Carbon Footprints');
    const response = await this.edcClient.getTranferedData(authKey, authCode);

    if (response.body) {
      const textData = await response.text();
      return convertRawDataToJSON(textData);
    }
  }

  async getAssetIdFromTransferProcess(transferProcessId: string) {
    const transferProcess = await this.edcClient.getTransferProcessById(
      transferProcessId
    );
    if (!transferProcess) return null;

    const assetId: string = transferProcess.mandatoryValue('edc', 'assetId');

    return assetId;
  }
  async shareAsset(input: ShareDataspaceAssetInput) {
    const { consumer, provider, numberOfRows, ...data } = input;
    await this.ensureFootprintHasNotBeenShared(
      input,
      provider.client_id,
      consumer.client_id
    );
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
    owner: string,
    sharedWith: string
  ) {
    const contractDefinitions =
      await this.edcClient.queryAllContractDefinitions({
        filterExpression: [
          ...builder.contractDefinitionFilter('owner', '=', owner),
          ...builder.contractDefinitionFilter('sharedWith', '=', sharedWith),
          ...builder.contractDefinitionFilter('month', '=', input.month),
          ...builder.contractDefinitionFilter('year', '=', input.year),
        ],
      });

    if (contractDefinitions.length) throw new ShipmentAlreadyShared();
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
