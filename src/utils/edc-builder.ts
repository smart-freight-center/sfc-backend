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
  props: Partial<PolicyDefinitionInput> = {}
): PolicyDefinitionInput {
  return defaults(props, {
    policy: {
      '@type': {
        '@policytype': 'offer',
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
