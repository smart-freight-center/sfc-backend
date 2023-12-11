import { ValidationError as JoiValidationError } from 'joi';

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

export class InternalServerError extends CustomError {
  name = 'internal_server_error';
  message = 'Something terrible happened';
  status = 500;
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
  constructor(error: JoiValidationError) {
    super('');
    const errorObject = this.extractErrorsFromJoiValidation(error);
    this.errors = errorObject;
  }

  private extractErrorsFromJoiValidation(error: JoiValidationError) {
    const errorObject: Record<string, string[]> = {};

    for (const detail of error.details) {
      const message = detail.message;

      const keyErrors = this.transformJoiValidionObject(
        errorObject,
        detail.path as string[]
      );
      const firstSpaceIndx = message.indexOf(' ');
      const prefix = 'This field ';
      keyErrors.push(prefix + message.slice(firstSpaceIndx + 1));
    }
    return errorObject;
  }
  private transformJoiValidionObject(parentObject: object, keys: string[]) {
    let currentObject = parentObject;
    for (let i = 0; i < keys.length - 1; i++) {
      const currentKey = keys[i];
      currentObject[currentKey] = currentObject[currentKey] || {};
      currentObject = currentObject[currentKey];
    }

    const lastKey = keys[keys.length - 1];

    currentObject[lastKey] = currentObject[lastKey] || [];

    return currentObject[lastKey];
  }
}
