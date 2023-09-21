import { TypedError } from '@think-it-labs/typed-error';
import { ValidationError } from 'joi';

export enum EdcManagerErrorType {
  Duplicate = 'Duplicate',
  NotFound = 'NotFound',
  Unimplemented = 'Unimplemented',
  Unknown = 'Unknown',
}

export class EdcManagerError extends TypedError<EdcManagerErrorType> {}

class CustomError extends Error {}

export class InvalidInput extends CustomError {
  constructor(public readonly errors?: any) {
    super();
  }
}

export class KeyCloakCouldNotGenerateToken extends CustomError {}
export class InvalidTokenInSFCAPI extends CustomError {}
export class TransferNotInitiated extends CustomError {}
export class InvalidCredentials extends CustomError {}
export class ParticipantNotFound extends CustomError {}
export class ShipmentAlreadyShared extends CustomError {}
export class TransferInitiationFailed extends CustomError {}
export class CouldntFetchDataInSource extends CustomError {}

export class ContractNotFound extends CustomError {}

export class EmptyFootprintData extends CustomError {}
export class InvalidShipmentIdFormat extends CustomError {}
export class InvalidFootprintData extends CustomError {
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
