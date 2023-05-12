import { TypedError } from '@think-it-labs/typed-error';
import { ValidationError } from 'joi';

export enum EdcManagerErrorType {
  Duplicate = 'Duplicate',
  NotFound = 'NotFound',
  Unimplemented = 'Unimplemented',
  Unknown = 'Unknown',
}

export class EdcManagerError extends TypedError<EdcManagerErrorType> {}

class SFCBaseError extends Error {}

export class InvalidInput extends SFCBaseError {
  constructor(public readonly errors?: any) {
    super();
  }
}

export class KeyCloakCouldNotGenerateToken extends SFCBaseError {}
export class InvalidTokenInSFCAPI extends SFCBaseError {}
export class TransferNotInitiated extends SFCBaseError {}
export class InvalidCredentials extends SFCBaseError {}
export class ParticipantNotFound extends SFCBaseError {}
export class TransferInitiationFailed extends SFCBaseError {}
export class CouldntFetchDataInSource extends SFCBaseError {}

export class ContractNotFound extends SFCBaseError {}

export class EmptyFootprintData extends SFCBaseError {}
export class ShipmentAlreadyShared extends SFCBaseError {}
export class InvalidFootprintData extends SFCBaseError {
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
