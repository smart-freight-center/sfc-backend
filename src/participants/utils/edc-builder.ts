import {
  AssetInput,
  ContractDefinition,
  ContractOffer,
  ContractNegotiationRequest,
  DataAddressType,
  DataplaneInput,
  IDS_PROTOCOL,
  PolicyDefinitionInput,
  QuerySpec,
  ShareFootprintInput,
  Policy,
  TransferProcessInput,
  Addresses,
  Connector,
} from 'entities';
import { defaults } from 'lodash';
import { convertDateToTimestamp, randomUid } from 'utils/helpers';

export function assetInput(
  dataInput: ShareFootprintInput,
  connectorId: string
): AssetInput {
  const {
    shipmentId = randomUid(),
    dataLocation,
    trackingPeriod,
    type,
    contentType,
  } = dataInput;

  const mapper = {
    s3: 'AmazonS3',
    http: 'HttpData',
    azure: 'AzureStorage',
  };
  const startDate = trackingPeriod.split('-')[0];
  const endDate = trackingPeriod.split('-')[1];
  return {
    asset: {
      properties: {
        'asset:prop:id': `${shipmentId}-${connectorId}`,
        'asset:prop:name': dataLocation.name || shipmentId,
        'asset:prop:description': `${convertDateToTimestamp(
          startDate
        )}-${convertDateToTimestamp(endDate)}`,
        'asset:prop:version': Date.now().toString(),
        'asset:prop:contenttype': contentType,
      },
    },
    dataAddress: {
      properties: {
        ...dataLocation,
        type: mapper[type.toLowerCase()],
      },
    },
  } as AssetInput;
}

export function policyInput(
  assetId: string,
  dataInput: Partial<PolicyDefinitionInput> = {}
): PolicyDefinitionInput {
  const permissions = [
    {
      target: assetId,
      action: {
        type: 'USE',
      },
      edctype: 'dataspaceconnector:permission',
    },
  ];

  return defaults(dataInput, {
    policy: {
      permissions: permissions,
      '@type': {
        '@policytype': 'set',
      },
    },
  });
}

export function contractDefinition(
  dataInput: Partial<ContractDefinition> = {}
): ContractDefinition {
  return defaults(dataInput, {
    id: randomUid(),
    criteria: [],
  });
}

export function filter(operandLeft, operandRight, operator = '='): QuerySpec {
  return {
    filterExpression: [
      {
        operandLeft: operandLeft,
        operandRight: operandRight,
        operator: operator,
      },
    ],
  };
}

export function contractNegotiationInput(
  contractOffer: ContractOffer,
  connector: Connector
): ContractNegotiationRequest {
  return {
    connectorAddress: `${connector.addresses.protocol}/data`,
    connectorId: connector.id,
    offer: {
      offerId: contractOffer.id as string,
      assetId: contractOffer.asset?.id as string,
      policy: contractOffer.policy as Policy,
    },
    protocol: IDS_PROTOCOL,
  };
}

export function transferProcessInput(
  shipmentId: string,
  connector: Connector,
  contractId: string
): TransferProcessInput {
  return {
    assetId: shipmentId,
    connectorAddress: `${connector.addresses.protocol}/data`,
    connectorId: connector.id,
    contractId: contractId,
    dataDestination: { type: DataAddressType.HttpType },
    managedResources: false,
  };
}

export function dataplaneInput(
  clientId: string,
  connectorAddresses: Addresses
): DataplaneInput {
  return {
    id: `${clientId}-dataplane`,
    url: `${connectorAddresses.control}/transfer`,
    allowedSourceTypes: ['HttpData'],
    allowedDestTypes: ['HttpProxy', 'HttpData'],
    properties: {
      publicApiUrl: connectorAddresses.public,
    },
  };
}
