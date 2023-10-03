import { TypedError } from '@think-it-labs/typed-error';
import { ValidationError } from 'joi';
import {
  DataConflict,
  InvalidUserInput,
  NotFound,
  NotImplemented,
  ServiceUnavailable,
  Unauthorized,
} from './base-errors';

export enum EdcManagerErrorType {
  Duplicate = 'Duplicate',
  NotFound = 'NotFound',
  Unimplemented = 'Unimplemented',
  Unknown = 'Unknown',
}

export class EdcManagerError extends TypedError<EdcManagerErrorType> {}

export class KeyCloakCouldNotGenerateToken extends ServiceUnavailable {}

export class InvalidTokenInSFCAPI extends NotImplemented {
  name = 'public_key_not_provided';
  message = 'Your infrastructure setup for Keycloak is incomplete';
}
export class TransferNotInitiated extends DataConflict {
  name = 'transfer_not_initiated';
  message = 'Transfer for this shipment is not yet initiated';
}

export class InvalidInput extends InvalidUserInput {
  constructor(public readonly errors?: any) {
    super();
  }
}

export class InvalidCredentials extends Unauthorized {
  name = 'invalid_credentials';
  message = 'Invalid Credentials';
}
export class ParticipantNotFound extends NotFound {
  name = 'participant_not_found';
  message = 'Participant not found';
}
export class ShipmentAlreadyShared extends DataConflict {
  message = 'This shipment has already been shared with that company.';
  name = 'shipment_already_shared';
}
export class TransferInitiationFailed {}
export class CouldntFetchDataInSource extends InvalidUserInput {
  name = 'no_data_in_datasource';
  message = "Couldn't fetch data in the specified source";
}

export class ContractNotFound extends NotFound {
  name = 'contract_not_found';
  message = 'Contract Not Found';
}

export class EmptyFootprintData extends InvalidUserInput {
  message = 'The datasource is empty or has only the header';
}
export class InvalidShipmentIdFormat extends InvalidUserInput {
  message = 'The shipment Id should not containt `-`, `:`, `?` or `_`';
  name = 'invalid_shipment_id_format';
}
export class DataModelValidationFailed extends InvalidUserInput {
  name = 'data_model_validation_failed';
  message = 'The footprint data you specified does not meet the data model';

  public readonly errors: object;
  constructor(joiError: ValidationError) {
    super();

    const errors = this.formatError(joiError);
    this.errors = errors;
  }

  private formatError(joiError: ValidationError) {
    const finalObj = {};
    const setBasedMsgs = {};
    for (const errorItem of joiError.details) {
      if (errorItem.path.length === 0) {
        return {
          msgs: ['The content of your data is not an array'],
        };
      }
      const { path, message } = errorItem;
      const key = errorItem.path[1];
      const currentKeyError = finalObj[key] || {
        rows: [],
        msgs: [],
      };

      const currentMsgSet = setBasedMsgs[key] || new Set<string>();

      const firstSpace = message.indexOf(' ');
      const msg = message.slice(firstSpace + 1);

      currentKeyError.rows.push(+path[0] + 1);

      if (!currentMsgSet.has(msg)) {
        currentMsgSet.add(msg);
        setBasedMsgs[key] = currentMsgSet;
        currentKeyError.msgs.push(msg);
      }

      finalObj[key] = currentKeyError;
    }
    return finalObj;
  }
}
