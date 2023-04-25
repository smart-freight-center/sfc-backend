import Validator, { Rules } from 'validatorjs';
import { InvalidInput } from './error';
import * as crypto from 'node:crypto';

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

export const convertDateToTimestamp = (dateString: string): string => {
  const [day, month, year] = dateString.split('/');
  const timestamp = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day)
  ).getTime();
  return Math.floor(timestamp / 1000).toString();
};

export const isValidDateFormat = (dateString: string): void => {
  console.log('dateString', dateString);
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = regex.exec(dateString);
  console.log('match', match);
  if (!match) {
    throw new InvalidInput(
      'Please insert a date following the dd/mm/yyyy format'
    );
  }
  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  if (!(day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1970)) {
    throw new InvalidInput('Please verify that you inserted a valid date');
  }
};

export const randomUid = () => {
  return crypto.randomUUID();
};
