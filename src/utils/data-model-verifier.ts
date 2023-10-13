import { shareFootprintInputSchema } from 'core/validators/share-footprint-schema';
import { convertRawDataToJSON } from './data-converter';
import { DataModelValidationFailed } from './errors';
import { EmissionDataModel } from 'core/types';

export async function verifyDataModel(
  shipmentId: string,
  rawData: string | object
) {
  const jsonData = convertRawDataToJSON(rawData);

  const { error, value } = shareFootprintInputSchema
    .dataModel()
    .validate(jsonData, {
      abortEarly: false,
    });

  if (!error?.details) return value as EmissionDataModel[];

  throw new DataModelValidationFailed(error);
}
