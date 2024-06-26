import * as builder from 'utils/edc-builder';

import {
  DeleteAssetInput,
  FootprintMetaData,
  ISfcDataSpace,
  MonthFilter,
  ShareDataspaceAssetInput,
  SingleAssetDetail,
  TransferCallbackInput,
} from 'core/usecases/interfaces';
import { convertRawDataToJSON } from 'utils/data-converter';
import {
  NoDataInAssetDataAddress,
  ShipmentAlreadyShared,
  ShipmentForMonthNotFound,
} from 'utils/errors';
import { EdcTransferService } from './edc-transfer-service';
import { IEdcClient } from './interfaces';
import { EmissionDataModel, Participant } from 'core/types';
import { CriterionInput, Offer } from '@think-it-labs/edc-connector-client';
import { AppLogger } from 'utils/logger';
import axios from 'axios';

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
          builder.CONTRACT_DEFINITION_QUERY_FILTER,
          builder.filterByContractDefinitionByQuery('owner', ownerId),
        ],
      });

    const assetIds = new Set(contractDefinitions.map((item) => item['@id']));

    return assets
      .filter((asset) => assetIds.has(asset['@id']))
      .map((asset) => ({
        owner: asset.properties.mandatoryValue('edc', 'owner'),
        numberOfRows: Number(
          asset.properties.mandatoryValue('edc', 'numberOfRows')
        ),
        month: Number(asset.properties.mandatoryValue('edc', 'month')),
        sharedWith: asset.properties.mandatoryValue('edc', 'sharedWith'),
        year: Number(asset.properties.mandatoryValue('edc', 'year')),
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
          builder.CONTRACT_DEFINITION_QUERY_FILTER,
          builder.filterByContractDefinitionByQuery('owner', providerId),
          builder.filterByContractDefinitionByQuery('sharedWith', companyId),
          builder.filterByContractDefinitionByQuery('month', month),
          builder.filterByContractDefinitionByQuery('year', year),
        ],
      });

    if (!contractDefinitions?.length) throw new ShipmentForMonthNotFound();

    for (const contractDefinition of contractDefinitions) {
      await this.edcClient.deleteContractDefinition(contractDefinition.id);
      await this.deleteAssetById(contractDefinition['@id']);
    }
  }

  private async deleteAssetById(assetId: string) {
    try {
      await this.edcClient.deleteAsset(assetId);
    } catch (error) {
      logger.warn(
        'There was an error while deleting the asset. It might have a contract agreement',
        { error }
      );
    }
  }
  public async fetchCarbonFootprint(input: TransferCallbackInput) {
    logger.info('Fetching Carbon Footprints...');

    try {
      const response = await axios.get(input.endpoint, {
        headers: {
          [input.authKey]: input.authCode,
        },
      });
      const textData = response.data;
      const jsonData = convertRawDataToJSON(textData);
      return this.parseRawData(jsonData);
    } catch (error) {
      logger.error(
        'Error occured while fetching carbon footprint. No data in the data source',
        { error }
      );
      throw new NoDataInAssetDataAddress();
    }
  }

  private parseRawData(rawFootprintData): EmissionDataModel[] {
    const parsedDataModel: EmissionDataModel[] = [];

    for (const item of rawFootprintData) {
      const singleRowOfData: EmissionDataModel = {
        id_tce: item.id_tce,
        id_tce_order: item.id_tce_order,
        id_consignment: item.id_consignment,
        id_shipment: item.id_shipment,
        transport_activity: Number(item.transport_activity),
        mass: Number(item.mass),
        empty_distance_factor: Number(item.empty_distance_factor),
        empty_distance_factor_add_information:
          item.empty_distance_factor_add_information,
        co2e_ttw: Number(item.co2e_ttw),
        co2e_wtw: Number(item.co2e_wtw),
        co2e_intensity_wtw_unit: item.co2e_intensity_wtw_unit,
        co2e_intensity_wtw: Number(item.co2e_intensity_wtw),
        energy_carrier_feedstock_N: item.energy_carrier_feedstock_N,
        temp_control: item.temp_control,
        transport_operator_name: item.transport_operator_name,
        distance_activity: Number(item.distance_activity),
        mode_of_transport: item.mode_of_transport,
        load_factor: Number(item.load_factor),
        empty_distance: Number(item.empty_distance),
        energy_carrier_N: item.energy_carrier_N,
        Feedstock_N: item.Feedstock_N,
        unloading_city: item.unloading_city,
        unloading_country: item.unloading_country,
        loading_country: item.loading_country,
        loading_city: item.loading_city,
        loading_date: item.loading_date,
        unloading_date: item.unloading_date,
        verification:
          item.verification?.toUpperCase() === 'TRUE' ||
          Number(item.verification) === 1 ||
          Boolean(item.verification),
        accreditation:
          item.accreditation?.toUpperCase() === 'TRUE' ||
          Number(item.accreditation) === 1 ||
          Boolean(item.accreditation),
      };

      if (item.load_factor_add_information) {
        singleRowOfData.load_factor_add_information =
          item.load_factor_add_information;
      }

      if (item.load_factor_add_information) {
        singleRowOfData.load_factor_add_information =
          item.load_factor_add_information;
      }
      if (Number.isFinite(+item.distance_actual)) {
        singleRowOfData.distance_actual = Number(item.distance_actual);
      }

      if (Number.isFinite(+item.WTW_fuel_emission_factor)) {
        singleRowOfData.WTW_fuel_emission_factor = Number(
          item.WTW_fuel_emission_factor
        );
      }

      if (item.asset_type) {
        singleRowOfData.asset_type = item.asset_type;
      }

      parsedDataModel.push(singleRowOfData);
    }

    return parsedDataModel;
  }

  async getAssetIdFromTransferProcess(transferProcessId: string) {
    const transferProcess = await this.edcClient.getTransferProcessById(
      transferProcessId
    );
    if (!transferProcess) return null;

    const assetId: string = transferProcess.mandatoryValue('edc', 'assetId');

    return assetId;
  }

  private buildContractQuery(
    left: string,
    operator: string,
    right: string | number
  ) {
    return `${left}${operator}${right}`;
  }

  async shareAsset(input: ShareDataspaceAssetInput) {
    logger.info('Sharing carbon footprint data  with user...');
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
      const query = [
        this.buildContractQuery(
          'owner',
          builder.CONTRACT_QUERY_EQ_OPERATOR,
          provider.client_id
        ),
        this.buildContractQuery(
          'month',
          builder.CONTRACT_QUERY_EQ_OPERATOR,
          data.month
        ),
        this.buildContractQuery(
          'year',
          builder.CONTRACT_QUERY_EQ_OPERATOR,
          data.year
        ),
        this.buildContractQuery(
          'sharedWith',
          builder.CONTRACT_QUERY_EQ_OPERATOR,
          consumer.client_id
        ),
      ].join(',');

      const assetInput = builder.assetInput({
        ...data,
        providerClientId: provider.client_id,
        sharedWith: consumer.client_id,
        numberOfRows,
        query,
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
        builder.assetFilter('query', '=', query),
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
          builder.CONTRACT_DEFINITION_QUERY_FILTER,
          builder.filterByContractDefinitionByQuery('owner', owner),
          builder.filterByContractDefinitionByQuery('sharedWith', sharedWith),
          builder.filterByContractDefinitionByQuery('month', input.month),
          builder.filterByContractDefinitionByQuery('year', input.year),
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
