import { shareFootprintInputSchema } from 'core/validators/share-footprint-schema';
import { convertRawDataToJSON } from './data-converter';
import { DataModelValidationFailed } from './errors';
import { EmissionDataModel } from 'core/types';

export async function verifyDataModel(
  { month, year }: { month: number; year: number },
  rawData: string | object
) {
  const jsonData = convertRawDataToJSON(rawData);
  const { error, value } = shareFootprintInputSchema
    .dataModel(month, year)
    .validate(jsonData, {
      abortEarly: false,
      allowUnknown: true,
    });

  if (!error?.details) return value as EmissionDataModel[];

  throw new DataModelValidationFailed(error);
}
