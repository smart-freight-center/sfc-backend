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

  const jsonData = convertRawDataToJSON(rawData);
  const size = jsonData.length;

  const groupedErrorChunks: DataModelValidationFailed[] = [];
  const groupedValueChunks: EmissionDataModel[] = [];
  const chunkActions: Promise<void>[] = [];
  for (let i = 0; i < Math.ceil(size / CHUNK_SIZE); i++) {
    const dataChunk = jsonData.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const firstRowNumber = i * CHUNK_SIZE + 1;
    chunkActions.push(
      _runValidationAsync(input, dataChunk, {
        groupedErrorChunks,
        groupedValueChunks,
        firstRowNumber,
      })
    );
  }

  await Promise.all(chunkActions);
  if (groupedErrorChunks.length) {
    throw new CombinedDataModelValidationError(groupedErrorChunks);
  }
  return groupedValueChunks;
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
    } else if (error instanceof CombinedDataModelValidationError) {
      warning = Object.keys(error.errors);
    }
  }

  return { data: value, warning };
};

type RunValidationOptions = {
  groupedValueChunks: EmissionDataModel[];
  groupedErrorChunks: DataModelValidationFailed[];
  firstRowNumber: number;
};

/**
 * This runs the validation on a particular data input asynchronously
 * Running it async helps increase the speed and performance of the program
 * @param input
 * @param data the data we want to validate
 * @param options the options
 */
async function _runValidationAsync(
  input: DataModelInput,
  data: object,
  options: RunValidationOptions
) {
  const { month, year, allowUnknown = true } = input;
  const { groupedErrorChunks, groupedValueChunks, firstRowNumber } = options;
  const { error, value } = shareFootprintInputSchema
    .dataModel(month, year)
    .validate(data, {
      abortEarly: false,
      allowUnknown,
    });

  if (!error?.details) groupedValueChunks.push(...value);
  else {
    const validationError = new DataModelValidationFailed(
      error,
      firstRowNumber
    );
    groupedErrorChunks.push(validationError);
  }
}
