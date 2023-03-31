import Validator, { Rules } from 'validatorjs';

import { InvalidInput } from 'core/error';

export const validateSchema = (data: object, schema: Rules): void => {
  const validation = new Validator(data, schema);

  if (validation.fails()) {
    throw new InvalidInput(validation.errors.errors);
  }
};
