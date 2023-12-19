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
import {
  Constraint,
  CriterionInput,
  Offer,
} from '@think-it-labs/edc-connector-client';

type ShareAssetInput = ShareFootprintInput & {
  providerClientId: string;
  sharedWith: string;
  numberOfRows: number;
  query: string;
};

export function assetInput(dataInput: ShareAssetInput): AssetInput {
  const { month, year, dataLocation, numberOfRows, type, query } = dataInput;

  const now = new Date();

  const mapper = {
    s3: 'AmazonS3',
    http: 'HttpData',
    azure: 'AzureStorage',
  };

  const assetId = `${month}-${year}_$${+now}`;
  return {
    '@id': assetId,
    properties: {
      month: Math.floor(month).toString(),
      year: Math.floor(year).toString(),
      owner: dataInput.providerClientId,
      sharedWith: dataInput.sharedWith,
      numberOfRows: Math.floor(numberOfRows).toString(),
      query,
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
  const constraint = BPNPolicyConstraint(consumerPolicyBPN);
  const permission = [
    {
      constraint,
      action: 'use',
    },
  ];
  return {
    policy: {
      permission,
    },
  };
}

function BPNPolicyConstraint(policyBPN: string): Constraint[] {
  if (!policyBPN) return [];

  return [
    {
      and: [
        {
          '@type': 'Constraint',
          leftOperand: 'BusinessPartnerNumber',
          rightOperand: policyBPN,
          operator: 'eq',
        },
      ],
    },
  ];
}

export function contractDefinition(
  assetId: string,
  policyId: string,
  assetsSelector: CriterionInput[]
): ContractDefinitionInput {
  return {
    '@id': assetId,
    accessPolicyId: policyId,
    contractPolicyId: policyId,
    assetsSelector,
  };
}

export function assetFilter(
  operandLeft: string,
  operator = '=',
  operandRight: string | number | boolean
): CriterionInput {
  return {
    operandLeft: `https://w3id.org/edc/v0.0.1/ns/${operandLeft}`,
    operandRight: `${operandRight}`,
    operator: operator,
  };
}

export const CONTRACT_DEFINITION_QUERY_FILTER = {
  operandLeft: 'assetsSelector.operandLeft',
  operator: '=',
  operandRight: 'https://w3id.org/edc/v0.0.1/ns/query',
};

// This was used as a walkaround to fix the bug that existed when filtering contract definitions
// It fixes a bug that ensures that the filter works in both upstream and local connectors
export const CONTRACT_QUERY_EQ_OPERATOR = 'SFCEQEQ';

export function filterByContractDefinitionByQuery(
  left: string,
  right: string | number | boolean
): CriterionInput {
  return {
    operandLeft: 'assetsSelector.operandRight',
    operator: 'LIKE',
    operandRight: `%${left}${CONTRACT_QUERY_EQ_OPERATOR}${right}%`,
  };
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
    connectorAddress: `${connector.addresses.protocol}`,
    connectorId: connector.id,
    contractId: contractId,
    dataDestination: { type: DataAddressType.HttpType },
  };
}
