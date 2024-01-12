import { validateData } from 'utils/helpers';
import { shareFootprintInputSchema } from 'core/validators/';

import { validateDataModelAndWarning } from 'utils/data-model-verifier';
import { IDataModelValidator } from 'core/usecases/interfaces';
import { ValidateDataModelInput } from 'entities';

export class ValidateDataModelUsecase {
  constructor(private dataSourceService: IDataModelValidator) {}

  public async execute(input: Partial<ValidateDataModelInput>) {
    console.log('started validation');
    const validatedInput = this.validateInput(input);
    const rawData = await this.dataSourceService.fetchFootprintData(
      validatedInput
    );

    console.log('getting date');
    const { month, year } = validatedInput;
    console.log('getting data');
    const { data, warning } = await validateDataModelAndWarning(
      { month, year },
      rawData
    );
    console.log('finishing');
    return { numberOfRows: data.length, warning };
  }

  private validateInput(input: Partial<ValidateDataModelInput>) {
    input = validateData(shareFootprintInputSchema.validated, input);

    if (input.type === 'azure') {
      validateData(shareFootprintInputSchema.azure, input);
    }
    if (input.type === 's3') {
      validateData(shareFootprintInputSchema.s3, input);
    }
    if (input.type === 'http') {
      validateData(shareFootprintInputSchema.http, input);
    }

    return input as ValidateDataModelInput;
  }
}
