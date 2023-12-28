import joi, { CustomHelpers } from 'joi';
import countries from 'i18n-iso-countries';

const countryCodeValidator = (value: string, helpers: CustomHelpers) => {
  if (countries.isValid(value)) return value;

  return helpers.error('isocode.invalid');
};
const dataModelSchema = (month: number, year: number) => {
  const monthStr = month.toString().padStart(2, '0');
  const firstDayOfMonth = new Date(`${year}-${monthStr}-01`);
  const lastDayOfMonth = new Date(`${year}-${month}-01`);

  lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
  lastDayOfMonth.setMilliseconds(lastDayOfMonth.getMilliseconds() - 1);
  return joi.array().items(
    joi
      .object({
        id_tce: joi.string().required(),
        id_tce_order: joi.string().required(),
        id_consignment: joi.string().required(),
        id_shipment: joi.string().required(),
        transport_activity: joi.number().positive().required(),
        mass: joi.number().positive().required(),
        distance_actual: joi.number().positive().optional().allow(null),
        mode_of_transport: joi
          .string()
          .lowercase()
          .valid('rail', 'road', 'sea', 'air', 'inland waterway', 'hub')
          .required(),
        asset_type: joi.string().allow(null),
        co2e_wtw: joi.number().min(0).allow(null).optional(),
        co2e_ttw: joi.number().min(0).allow(null).optional(),
        load_factor: joi.number().greater(0).max(1).required(),
        load_factor_add_information: joi.string().optional().allow(null),
        empty_distance_factor: joi.number().greater(0).less(1).required(),
        empty_distance_factor_add_information: joi
          .string()
          .allow(null)
          .optional(),
        energy_carrier_N: joi.string().required(),
        Feedstock_N: joi.string().required(),
        loading_date: joi
          .date()
          .iso()
          .max(joi.ref('unloading_date'))
          .required(),
        unloading_date: joi
          .date()
          .iso()
          .min(firstDayOfMonth)
          .max(lastDayOfMonth)
          .required(),
        verification: joi.boolean().falsy('0').truthy('1').required(),
        accreditation: joi
          .boolean()
          .falsy('0')
          .truthy('1')
          .allow(null)
          .optional(),
        transport_operator_name: joi.string().lowercase().required(),
        temp_control: joi
          .string()
          .lowercase()
          .valid('frozen', 'refrigerated', 'ambient', 'high temp')
          .required(),
        energy_carrier_feedstock_N: joi.string().required(),
        WTW_fuel_emission_factor: joi.number().min(0).allow(null).optional(),
        co2e_intensity_wtw: joi.number().positive().required(),
        distance_activity: joi.number().positive().required(),
        loading_city: joi.string().required(),
        loading_country: joi
          .string()
          .max(3)
          .custom(countryCodeValidator)
          .required(),
        unloading_country: joi
          .string()
          .max(3)
          .custom(countryCodeValidator)
          .required(),
        unloading_city: joi.string().required(),
        co2e_intensity_wtw_unit: joi.string().required(),
      })
      .messages({
        'isocode.invalid': 'field must be a valid iso2 or iso3 country code',
      })
  );
};

export const joiHttpSchema = joi.object({
  dataLocation: {
    name: joi.string().required(),
    baseUrl: joi.string().uri().required(),
    path: joi.string(),
    method: joi.string(),
    authKey: joi.string(),
    authCode: joi.string(),
    secretName: joi.string(),
    proxyBody: joi.string(),
    proxyPath: joi.string(),
    proxyQueryParams: joi.string(),
    proxyMethod: joi.string(),
    contentType: joi.string(),
  },
});
const joiS3Schema = joi.object({
  dataLocation: joi.object({
    name: joi.string().required(),
    bucketName: joi.string().required(),
    region: joi.string().required(),
    keyName: joi.string().required(),
  }),
});
const joiAzureSchema = joi.object({
  dataLocation: {
    container: joi.string().required(),
    account: joi.string().required(),
    blobname: joi.string().required(),
  },
});
const sharedSchema = joi.object({
  month: joi.number().integer().greater(0).less(13).required(),
  year: joi.number().required(),
  companyId: joi.string().required(),
  type: joi.string().required().lowercase().valid('azure', 'http', 's3'),
  dataLocation: joi.object().required(),
});

const validatedSchema = joi.object({
  month: joi.number().integer().greater(0).less(13).required(),
  year: joi.number().required(),
  type: joi.string().required().lowercase().valid('azure', 'http', 's3'),
  dataLocation: joi.object().required(),
});

export const rawDataValidationSchema = joi.object({
  month: joi.number().integer().greater(0).less(13).required(),
  year: joi.number().required(),
  rawData: joi.string().required(),
});

export const shareFootprintInputSchema = {
  shared: sharedSchema,
  validated: validatedSchema,
  azure: joiAzureSchema,
  http: joiHttpSchema,
  s3: joiS3Schema,
  dataModel: dataModelSchema,
};
