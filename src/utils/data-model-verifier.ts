import { shareFootprintInputSchema } from 'core/validators/share-footprint-schema';
import { convertRawDataToJSON } from './data-converter';
import {
  CombinedDataModelValidationError,
  DataModelValidationFailed,
} from './errors';
import { EmissionDataModel } from 'core/types';

type DataModelInput = { month: number; year: number; allowUnknown?: boolean };

export async function verifyDataModel(
  input: DataModelInput,
  rawData: string | object
) {
  const CHUNK_SIZE = 9000;

  const { month, year, allowUnknown = true } = input;
  const jsonData = convertRawDataToJSON(rawData);
  const size = jsonData.length;

  const combinedErrors: DataModelValidationFailed[] = [];
  const combinedValues: EmissionDataModel[] = [];
  for (let i = 0; i < Math.ceil(size / CHUNK_SIZE); i++) {
    const data = jsonData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const { error, value } = shareFootprintInputSchema
      .dataModel(month, year)
      .validate(data, {
        abortEarly: false,
        allowUnknown,
      });

    if (!error?.details) combinedValues.push(...value);
    else {
      const validationError = new DataModelValidationFailed(
        error,
        i * CHUNK_SIZE + 1
      );
      combinedErrors.push(validationError);
    }
  }

  if (combinedErrors.length) {
    throw new CombinedDataModelValidationError(combinedErrors);
  }
  return combinedValues;
}

export const validateDataModelAndWarning = async (
  input: Omit<DataModelInput, 'allowUnknown'>,
  rawData: string | object
) => {
  const { month, year } = input;
  let passedValidationWithKnownFields = false;
  let value = [] as EmissionDataModel[];
  let warning;
  try {
    value = await verifyDataModel({ month, year, allowUnknown: true }, rawData);

    passedValidationWithKnownFields = true;
    await verifyDataModel({ month, year, allowUnknown: false }, rawData);
  } catch (error) {
    if (!passedValidationWithKnownFields) {
      throw error;
    } else if (error instanceof DataModelValidationFailed) {
      warning = Object.keys(error.errors);
    }
  }

  return { data: value, warning };
};
