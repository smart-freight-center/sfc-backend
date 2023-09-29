import Validator, { Rules } from 'validatorjs';
import { EdcManagerError, EdcManagerErrorType, InvalidInput } from './errors';
import { Context } from 'koa';

export const validateSchema = (
  data: object,
  schema: Rules,
  customMsg?: object
): void => {
  const validation = new Validator(data, schema, customMsg);

  if (validation.fails()) {
    throw new InvalidInput(validation.errors.errors);
  }
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
};

export const handleErrors = (context: Context, error: Error) => {
  if (error instanceof EdcManagerError) {
    context.set('Content-type', 'application/json');
    switch (error.type) {
      case EdcManagerErrorType.NotFound: {
        context.status = 404;
        context.body = {
          code: error.type,
          message: error.message,
        };
        break;
      }
      case EdcManagerErrorType.Duplicate: {
        context.status = 409;
        context.body = {
          code: error.type,
          message: error.message,
        };
        break;
      }
      case EdcManagerErrorType.Unknown:
      default: {
        context.status = 500;
        context.body = {
          code: error.type,
          message: error.message,
        };
        break;
      }
    }

    return;
  }

  context.status = 500;
  context.body = {
    code: 'Unknown',
    error,
  };
};
