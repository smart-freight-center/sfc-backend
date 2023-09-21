import { ValidationError } from 'joi';

export abstract class CustomError extends Error {
  name = 'custom_error';
  status = -1;
}

export class InvalidUserInput extends CustomError {
  name = 'invalid_user_input';
  message = 'Invalid Input';
  errors?: object = {};
  status = 400;
}

export class NotFound extends CustomError {
  name = 'not_found';
  message = 'Resource not found';
  status = 404;
}

export class ServiceUnavailable extends CustomError {
  name = 'service_unavailable';
  message = 'Service is unavailable';
  status = 503;
}

export class NotImplemented extends CustomError {
  name = 'not_implemented';
  message = 'Setup is missing';
  status = 501;
}

export class DataConflict extends CustomError {
  message = 'Cannot create duplicate';
  status = 409;
}

export class Unauthorized extends CustomError {
  message = 'Not authorized';
  status = 401;
}

export class DataValidationError extends InvalidUserInput {
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
