import joi from 'joi';

const dataModelSchema = (month: number, year: number) => {
  const monthStr = month.toString().padStart(2, '0');
  const firstDayOfMonth = new Date(`${year}-${monthStr}-01`);
  const lastDayOfMonth = new Date(`${year}-${month}-01`);

  lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
  lastDayOfMonth.setMilliseconds(lastDayOfMonth.getMilliseconds() - 1);
  return joi.array().items(
    joi.object({
      id_tce: joi.string().required(),
      id_consignment: joi.string().required(),
      id_shipment: joi.string().required(),
      transport_activity: joi.number().required(),
      mass: joi.number().required(),
      distance_actual: joi.number().required(),
      mode_of_transport: joi.string().required(),
      asset_type: joi.string().required(),
      co2e_wtw: joi.number().required(),
      load_factor: joi.number().required(),
      empty_distance: joi.number().required(),
      energy_carrier_N: joi.string().required(),
      Feedstock_N: joi.string().required(),
      loading_date: joi.date().optional(),
      unloading_date: joi
        .date()
        .min(firstDayOfMonth)
        .max(lastDayOfMonth)
        .required(),
      verification: joi.boolean().required(),
      accreditation: joi.boolean().required(),
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
  contentType: joi.string().valid('application/json', 'text/csv'),
  type: joi.string().required().lowercase().valid('azure', 'http', 's3'),
  dataLocation: joi.object().required(),
});

const validatedSchema = joi.object({
  month: joi.number().integer().greater(0).less(13).required(),
  year: joi.number().required(),
  contentType: joi.string().valid('application/json', 'text/csv'),
  type: joi.string().required().lowercase().valid('azure', 'http', 's3'),
  dataLocation: joi.object().required(),
});

export const shareFootprintInputSchema = {
  shared: sharedSchema,
  validated: validatedSchema,
  azure: joiAzureSchema,
  http: joiHttpSchema,
  s3: joiS3Schema,
  dataModel: dataModelSchema,
};
