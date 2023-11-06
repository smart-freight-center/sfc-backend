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

type ShareAssetInput = ShareFootprintInput & {
  providerClientId: string;
  sharedWith: string;
  numberOfRows: number;
};

export function assetInput(dataInput: ShareAssetInput): AssetInput {
  const { month, year, dataLocation, type } = dataInput;

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
      month: dataInput.month,
      year: dataInput.year,
      owner: dataInput.providerClientId,
      sharedWith: dataInput.sharedWith,
      numberOfRows: dataInput.numberOfRows,
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
      filterExpression: [assetFilter(operandLeft, operandRight, operator)],
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
    connectorAddress: `${connector.addresses.protocol}`,
    connectorId: connector.id,
    contractId: contractId,
    dataDestination: { type: DataAddressType.HttpType },
    properties: {
      receiverHttpEndpoint:
        'https://webhook.site/5fc7d035-2c8b-4dec-9ceb-67e3aff5ef4f',
      contractId,
    },
  };
}
