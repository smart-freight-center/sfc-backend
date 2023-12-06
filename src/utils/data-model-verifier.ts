import { shareFootprintInputSchema } from 'core/validators/share-footprint-schema';
import { convertRawDataToJSON } from './data-converter';
import { DataModelValidationFailed } from './errors';
import { EmissionDataModel } from 'core/types';

type DataModelInput = { month: number; year: number; allowUnknown?: boolean };

export async function verifyDataModel(
  input: DataModelInput,
  rawData: string | object
) {
  const { month, year, allowUnknown = true } = input;
  const jsonData = convertRawDataToJSON(rawData);
  const { error, value } = shareFootprintInputSchema
    .dataModel(month, year)
    .validate(jsonData, {
      abortEarly: false,
      allowUnknown,
    });

  if (!error?.details) return value as EmissionDataModel[];

  throw new DataModelValidationFailed(error);
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
