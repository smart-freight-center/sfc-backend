import { validateData } from 'utils/helpers';
import { shareFootprintInputSchema } from 'core/validators/';

import { verifyDataModel } from 'utils/data-model-verifier';
import { IDataModelValidator } from 'core/usecases/interfaces';
import { ValidateDataModelInput } from 'entities';

export class ValidateDataModelUsecase {
  constructor(private dataSourceService: IDataModelValidator) {}

  public async execute(input: Partial<ValidateDataModelInput>) {
    const validatedInput = this.validateInput(input);
    const rawData = await this.dataSourceService.fetchFootprintData(
      validatedInput
    );

    const { month, year } = validatedInput;
    const data = await verifyDataModel({ month, year }, rawData);
    return { numberOfRows: data.length };
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
