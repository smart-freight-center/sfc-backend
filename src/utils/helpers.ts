import Validator, { Rules } from 'validatorjs';
import { InvalidInput } from './error';

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
