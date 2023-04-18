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
} from 'entities';
import { defaults } from 'lodash';
import * as crypto from 'node:crypto';

function randomUid() {
  return crypto.randomUUID();
}

export function assetInput(dataInput: ShareFootprintInput): AssetInput {
  const {
    shipmentId = randomUid(),
    dataLocation,
    type,
    contentType,
  } = dataInput;

  const mapper = {
    s3: 'AmazonS3',
    http: 'HttpData',
    azure: 'AzureStorage',
  };
  return {
    asset: {
      properties: {
        'asset:prop:id': shipmentId,
        'asset:prop:name': dataLocation.name || shipmentId,
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

export function catalogAssetFilter(assetId: string): QuerySpec {
  return {
    filterExpression: [
      {
        operandLeft: 'asset:prop:id',
        operandRight: assetId,
        operator: '=',
      },
    ],
  };
}

export function contractNegotiationInput(
  contractOffer: ContractOffer,
  connectorIdsAddress: string
): ContractNegotiationRequest {
  const connectorId = extractConnectorId(connectorIdsAddress);
  return {
    connectorAddress: connectorIdsAddress,
    connectorId: connectorId,
    offer: {
      offerId: contractOffer.id as string,
      assetId: contractOffer.asset?.id as string,
      policy: contractOffer.policy as Policy,
    },
    protocol: IDS_PROTOCOL,
  };
}
//FIXME(@OlfaBensoussia): this is a temporary workaround until we implement the companies endpoint and logic units
function extractConnectorId(connectorIdsAddress: string): string {
  const startIndex = connectorIdsAddress.indexOf('//');
  const endIndex = connectorIdsAddress.indexOf(':', startIndex + 2);
  return connectorIdsAddress.substring(startIndex + 2, endIndex);
}
export function transferProcessInput(
  shipmentId: string,
  connectorId: string,
  connectorAddress: string,
  contractId: string
): TransferProcessInput {
  return {
    assetId: shipmentId,
    connectorAddress: `${connectorAddress}/data`,
    connectorId: connectorId,
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
