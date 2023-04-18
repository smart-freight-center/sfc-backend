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
import * as crypto from 'node:crypto';

function randomUid() {
  return crypto.randomUUID();
}

export function assetInput(
  props: Partial<ShareFootprintInput> = {}
): AssetInput {
  const { shipmentId = randomUid(), dataAddress } = props;

  return {
    asset: {
      properties: {
        'asset:prop:id': shipmentId,
        'asset:prop:name': shipmentId,
      },
    },
    dataAddress: dataAddress,
  } as AssetInput;
}

export function policyInput(
  assetId: string,
  props: Partial<PolicyDefinitionInput> = {}
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

  return defaults(props, {
    policy: {
      permissions: permissions,
      '@type': {
        '@policytype': 'set',
      },
    },
  });
}

export function contractDefinition(
  props: Partial<ContractDefinition> = {}
): ContractDefinition {
  return defaults(props, {
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
