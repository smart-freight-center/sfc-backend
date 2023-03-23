import {
  AssetInput,
  ContractDefinition,
  PolicyDefinitionInput,
  ShareFootprintInput,
} from '../core/entities';
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
