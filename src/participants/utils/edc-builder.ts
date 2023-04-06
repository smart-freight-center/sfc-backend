import {
  AssetInput,
  ContractDefinition,
  ContractOffer,
  ContractNegotiationRequest,
  DataAddressType,
  IDS_PROTOCOL,
  PolicyDefinitionInput,
  QuerySpec,
  ShareFootprintInput,
  Policy,
  TransferProcessInput,
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
    connectorAddress: connectorAddress,
    connectorId: connectorId,
    contractId: contractId,
    dataDestination: { type: DataAddressType.HttpType },
    managedResources: false,
  };
}
