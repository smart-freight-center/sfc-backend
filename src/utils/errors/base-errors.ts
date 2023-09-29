import { ValidationError } from 'joi';

export class CustomError extends Error {
  name = 'custom_error';
}

export class InvalidUserInput extends CustomError {
  name = 'invalid_user_input';
  message = 'Invalid Input';
}

export class NotFound extends CustomError {
  name = 'not_found';
  message = 'Resource not found';
}

export class DataConflict extends CustomError {
  message = 'Cannot create duplicate';
}

export class Unauthorized extends CustomError {
  message = 'Not authorized';
}

export class DataValidationError extends CustomError {
  name = 'validation_error';
  public readonly errors: object;
  constructor(error: ValidationError) {
    super('');
    const errorObject: Record<string, string[]> = {};
    for (const detail of error.details) {
      const key = detail.context?.key as string;
      const message = detail.message;
      const keyErrors: string[] = errorObject[key] || [];
      const firstSpaceIndx = message.indexOf(' ');
      const prefix = 'This field ';
      keyErrors.push(prefix + message.slice(firstSpaceIndx + 1));
      errorObject[key] = keyErrors;
    }

    this.errors = errorObject;
  }
}
