import { TypedError } from '@think-it-labs/typed-error';

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
export class ParticipantNotFound extends SFCBaseError {}
