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
  policyBPN: string,
  dataInput: Partial<PolicyDefinitionInput> = {}
): PolicyDefinitionInput {
  const constraints = BPNPolicyConstraint(policyBPN);
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
    id: randomUid(),
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
