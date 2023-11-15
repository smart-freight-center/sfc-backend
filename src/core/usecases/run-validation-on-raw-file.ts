import { validateData } from 'utils/helpers';
import { rawDataValidationSchema } from 'core/validators/';

import { verifyDataModel } from 'utils/data-model-verifier';
import { ValidateRawDataModelInput } from 'entities';

export class RunValidationOnRawFileUsecase {
  public async execute(input: Partial<ValidateRawDataModelInput>) {
    const { month, year, rawData } = validateData(
      rawDataValidationSchema,
      input
    ) as ValidateRawDataModelInput;

    const data = await verifyDataModel({ month, year }, rawData);
    return { numberOfRows: data.length };
  }
}
