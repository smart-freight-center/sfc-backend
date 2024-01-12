import { TypedError } from '@think-it-labs/typed-error';
import { ValidationError } from 'joi';
import {
  DataConflict,
  InternalServerError,
  InvalidUserInput,
  NotFound,
  NotImplemented,
  ServiceUnavailable,
  Unauthorized,
} from './base-errors';

export enum EdcManagerErrorType {
  Duplicate = 'Duplicate',
  NotFound = 'NotFound',
  Unimplemented = 'Unimplemented',
  Unknown = 'Unknown',
}

export class EdcManagerError extends TypedError<EdcManagerErrorType> {}

export class KeyCloakCouldNotGenerateToken extends ServiceUnavailable {}

export class InvalidTokenInSFCAPI extends NotImplemented {
  name = 'public_key_not_provided';
  message = 'Your infrastructure setup for Keycloak is incomplete';
}

export class InvalidToken extends Unauthorized {
  name = 'invalid_token';
  message = 'Invalid token';
}

export class TransferNotInitiated extends DataConflict {
  name = 'transfer_not_initiated';
  message = 'Transfer for this shipment is not yet initiated';
}

export class InvalidInput extends InvalidUserInput {
  constructor(public readonly errors?: any) {
    super();
  }
}

export class InvalidCredentials extends Unauthorized {
  name = 'invalid_credentials';
  message = 'Invalid Credentials';
}

export class AccountNotSetup extends Unauthorized {
  name = 'account_setup_error';
  message =
    'Either you have not reset the password of that user or some setup is incomplete';
}
export class ParticipantNotFound extends NotFound {
  name = 'participant_not_found';
  message = 'Participant not found';
}
export class ShipmentAlreadyShared extends DataConflict {
  message =
    'The carbon footprint for that month has already been shared with that company.';
  name = 'shipment_already_shared';
}
export class TransferInitiationFailed extends ServiceUnavailable {
  name = 'transfer_initiation_failed';
  message =
    'The transfer initiation Failed. It is possible that your deployment setup is incomplete';
}
export class CouldntFetchDataInSource extends InvalidUserInput {
  name = 'no_data_in_datasource';
  message = "Couldn't fetch data in the specified source";
}

export class ContractNotFound extends NotFound {
  name = 'contract_not_found';
  message = 'Contract Not Found';
}

export class ShipmentForMonthNotFound extends NotFound {
  name = 'shipment_not_found';
  message = 'No Shipment for that month exists';
}

export class EmptyDataSource extends InvalidUserInput {
  name = 'empty_datasource';
  message = 'The datasource is empty or has only the header';
}

export class NoDataInAssetDataAddress extends InternalServerError {
  name = 'no_data_in_asset_data_address';
  message = 'The data address the user specified is currently empty';
}
export class InvalidShipmentIdFormat extends InvalidUserInput {
  message = 'The shipment Id should not containt `-`, `:`, `?` or `_`';
  name = 'invalid_shipment_id_format';
}

type DataModelErrorType = {
  rows: number[];
  msgs: string[];
};
export class DataModelValidationFailed extends InvalidUserInput {
  name = 'data_model_validation_failed';
  message = 'The footprint data you specified does not meet the data model';

  public errors: Record<string, DataModelErrorType> = {};
  constructor(joiError?: ValidationError, private firstRowNumber = 1) {
    super();

    if (joiError) {
      const errors = this.formatError(joiError);
      this.errors = errors;
    }
  }

  private formatError(joiError: ValidationError) {
    const finalObj = {};
    const setBasedMsgs = {};
    for (const errorItem of joiError.details) {
      if (errorItem.path.length === 0) {
        return {
          msgs: ['The content of your data is not an array'],
        };
      }
      const { path, message } = errorItem;
      const key = errorItem.path[1];
      const currentKeyError = finalObj[key] || {
        rows: [],
        msgs: [],
      };

      const currentMsgSet = setBasedMsgs[key] || new Set<string>();

      const firstSpace = message.indexOf(' ');
      const msg = message.slice(firstSpace + 1);

      currentKeyError.rows.push(+path[0] + this.firstRowNumber);

      if (!currentMsgSet.has(msg)) {
        currentMsgSet.add(msg);
        setBasedMsgs[key] = currentMsgSet;
        currentKeyError.msgs.push(msg);
      }

      finalObj[key] = currentKeyError;
    }
    return finalObj;
  }
}
export class CombinedDataModelValidationError extends InvalidUserInput {
  name = 'data_model_validation_failed';
  message = 'The footprint data you specified does not meet the data model';

  public readonly errors: object;
  constructor(errorsList: DataModelValidationFailed[]) {
    super();

    let currentError = new DataModelValidationFailed();
    if (errorsList.length >= 1) {
      currentError = errorsList[0];
    }
    for (let i = 1; i < errorsList.length; i++) {
      currentError = this.combineTwoErrorObjects(currentError, errorsList[i]);
    }

    this.errors = currentError.errors;
  }

  private combineTwoErrorObjects(
    error1: DataModelValidationFailed,
    error2: DataModelValidationFailed
  ) {
    /*
      error1--> {
        errors: {
          co2_emissions: {
            rows: [1,2,3],
            msgs: ['good', 'bad','ugly']
          },
          loading_city: {
            rows: [1,2,3],
            msgs: ['good', 'bad','ugly']
          }
        }
      }


       error2-> {
        errors: {
          co2_emissions: {
            rows: [4,5,6,8],
            msgs: ['good', 'bad','ugly']
          },
          loading_country: {
            rows: [1,2,3],
            msgs: ['good', 'bad','ugly']
          }
        }
      }


      result===> {
        co2_emissions: {
            rows: [1,2,3, 4,5,6,8],
            msgs: ['good', 'bad','ugly', 'good', 'bad','ugly']
          },
           loading_city: {
            rows: [1,2,3],
            msgs: ['good', 'bad','ugly']
          },
          loading_country: {
            rows: [1,2,3],
            msgs: ['good', 'bad','ugly']
          }
      }

    */

    let finalErrors = {
      ...error1.errors,
    };
    for (const [key, errorDetail] of Object.entries(error2.errors)) {
      if (finalErrors[key] && errorDetail[key]) {
        console.log('ifs statement...');

        finalErrors = {
          ...finalErrors,
          [key]: {
            rows: [...finalErrors[key].rows, ...errorDetail[key].rows],
            msgs: [...finalErrors[key].msgs, ...errorDetail[key].msgs],
          },
        };
      } else {
        console.log('else statement...', finalErrors);
        finalErrors = {
          ...finalErrors,
          [key]: errorDetail,
        };
      }
    }

    const finalErrorObject = new DataModelValidationFailed();

    finalErrorObject.errors = finalErrors;
    return finalErrorObject;
  }
}
