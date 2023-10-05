import dateAndTime from 'date-and-time';
import { v4 } from 'uuid';

import {
  AssetInput,
  ContractNegotiationRequest,
  DataAddressType,
  PolicyDefinitionInput,
  ShareFootprintInput,
  TransferProcessInput,
  Connector,
  ContractDefinitionInput,
} from 'entities';
import { EDC_FILTER_OPERATOR_SET } from 'utils/settings';
import {
  Constraint,
  CriterionInput,
  Offer,
} from '@think-it-labs/edc-connector-client';

function randomUid() {
  return v4();
}

export function assetInput(
  dataInput: ShareFootprintInput,
  providerClientId: string,
  sharedWith: string
): AssetInput {
  const { shipmentId, dataLocation, type, dateCreated } = dataInput;

  const now = new Date();

  const mapper = {
    s3: 'AmazonS3',
    http: 'HttpData',
    azure: 'AzureStorage',
  };

  const defaultVersion = dateAndTime.format(now, 'YYYY-MM-DD');
  const createdFilter = dateCreated || defaultVersion;

  return {
    '@id': `${shipmentId}-${sharedWith}__${+now}_${createdFilter}`,
    properties: {
      name: shipmentId,
      owner: providerClientId,
      sharedWith,
    },
    privateProperties: {},
    dataAddress: {
      ...dataLocation,
      '@type': mapper[type.toLowerCase()],
      type: mapper[type.toLowerCase()],
    },
  };
}
export function policyInput(consumerPolicyBPN: string): PolicyDefinitionInput {
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

  return {
    policy: {
      permission: permissions,
    },
  };
}

function BPNPolicyConstraint(policyBPN: string): Constraint[] {
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
): ContractDefinitionInput {
  return {
    '@id': `${assetId}-${randomUid()}`,
    accessPolicyId: policyId,
    contractPolicyId: policyId,
    assetsSelector: [
      {
        operandLeft: 'asset:prop:id',
        operator: '=',
        operandRight: 'new-asset-id',
      },
    ],
  };
}

export function filter(
  operandLeft,
  operandRight,
  operator = '='
): CriterionInput {
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
  contractOffer: Offer,
  connector: Connector
): ContractNegotiationRequest {
  return {
    connectorAddress: connector.addresses.protocol as string,
    connectorId: connector.id,
    providerId: connector.id,
    offer: {
      offerId: contractOffer.id,
      assetId: contractOffer.assetId,
      policy: contractOffer,
    },
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
  };
}
