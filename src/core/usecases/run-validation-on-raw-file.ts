import { validateData } from 'utils/helpers';
import { rawDataValidationSchema } from 'core/validators/';

import { validateDataModelAndWarning } from 'utils/data-model-verifier';
import { ValidateRawDataModelInput } from 'entities';

export class RunValidationOnRawFileUsecase {
  public async execute(input: Partial<ValidateRawDataModelInput>) {
    const { month, year, rawData } = validateData(
      rawDataValidationSchema,
      input
    ) as ValidateRawDataModelInput;

    const { data, warning } = await validateDataModelAndWarning(
      { month, year },
      rawData
    );
    return { numberOfRows: data.length, warning };
  }
}
