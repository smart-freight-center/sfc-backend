import dateAndTime from 'date-and-time';
import {
  AssetInput,
  ContractDefinition,
  ContractOffer,
  ContractNegotiationRequest,
  DataAddressType,
  IDS_PROTOCOL,
  PolicyDefinitionInput,
  Criterion,
  ShareFootprintInput,
  Policy,
  TransferProcessInput,
  Connector,
} from 'entities';
import { defaults } from 'lodash';
import * as crypto from 'node:crypto';
import { EDC_FILTER_OPERATOR_SET } from 'utils/settings';

function randomUid() {
  return crypto.randomUUID();
}

export function assetInput(
  dataInput: ShareFootprintInput,
  providerClientId: string,
  sharedWith: string
): AssetInput {
  const { shipmentId, dataLocation, type, dateCreated, contentType } =
    dataInput;

  const now = new Date();

  const mapper = {
    s3: 'AmazonS3',
    http: 'HttpData',
    azure: 'AzureStorage',
  };

  const defaultVersion = dateAndTime.format(now, 'YYYY-MM-DD');
  const createdFilter = dateCreated || defaultVersion;

  return {
    asset: {
      properties: {
        'asset:prop:id': `${shipmentId}-${sharedWith}__${+now}_${createdFilter}`,
        'asset:prop:name': dataLocation.name || shipmentId,
        'asset:prop:contenttype': contentType,
        'asset:prop:sharedWith': sharedWith,
        'asset:prop:owner': providerClientId,
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
  consumerPolicyBPN: string,
  dataInput: Partial<PolicyDefinitionInput> = {}
): PolicyDefinitionInput {
  const constraints = BPNPolicyConstraint(consumerPolicyBPN);
  const permissions = [
    {
      constraints: constraints,
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

function BPNPolicyConstraint(policyBPN: string) {
  if (!policyBPN) return [];
  return [
    {
      edctype: 'AtomicConstraint',
      leftExpression: {
        edctype: 'dataspaceconnector:literalexpression',
        value: 'BusinessPartnerNumber',
      },
      rightExpression: {
        edctype: 'dataspaceconnector:literalexpression',
        value: policyBPN,
      },
      operator: 'EQ',
    },
  ];
}

export function contractDefinition(
  assetId: string,
  policyId: string
): ContractDefinition {
  return {
    id: `${assetId}-${randomUid()}`,
    criteria: [filter('asset:prop:id', assetId)],
    accessPolicyId: policyId,
    contractPolicyId: policyId,
  };
}

export function filter(operandLeft, operandRight, operator = '='): Criterion {
  return {
    operandLeft: operandLeft,
    operandRight: operandRight,
    operator: operator,
  };
}

export function shipmentFilter(
  operandLeft: string,
  operandRight: string,
  operator: 'LIKE' | '=' = '='
) {
  if (EDC_FILTER_OPERATOR_SET.has(operator)) {
    return {
      filterExpression: [filter(operandLeft, operandRight, operator)],
    };
  }

  return;
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
  assetId: string,
  connector: Connector,
  contractId: string
): TransferProcessInput {
  return {
    assetId,
    connectorAddress: `${connector.addresses.protocol}/data`,
    connectorId: connector.id,
    contractId: contractId,
    dataDestination: { type: DataAddressType.HttpType },
    managedResources: false,
  };
}
