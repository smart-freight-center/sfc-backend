import joi from 'joi';
const shared = {
  shipmentId: 'required|min:2',
  companyId: 'required|min:2',
  contentType: 'in:application/json,text/csv',
  type: 'required|in:azure,s3,http',
  dataLocation: 'required|present',
  dateCreated: 'regex:/^\\d{4}-\\d{2}-[0-3]\\d$/',
};

const sharedCustomMessage = {
  'in.type':
    "The only data types that are allowed are 'azure', 's3' and 'http'",
  'in.contentType':
    "The allowed content Types are 'application/json' and 'text/csv'",
  'present.dataLocation': 'You need to specify the "dataLocation" object',
  'regex.dateCreated': 'Should be a valid date in the format YYYY-MM-DD',
};

const s3Schema = {
  dataLocation: {
    name: 'required|min:1',
    bucketName: 'required|min:1|string',
    region: 'required|min:1',
    keyName: 'min:4|required',
  },
};

const azureSchema = {
  dataLocation: {
    container: 'min:1|string',
    account: 'min:1',
    blobname: 'min:1|string',
  },
};
const httpSchema = {
  dataLocation: {
    name: 'min:1|required',
    baseUrl: 'required|min:5|url',
    path: 'min:1',
    method: 'min:1',
    authKey: 'min:1',
    authCode: 'min:1',
    secretName: 'min:1',
    proxyBody: 'min:1',
    proxyPath: 'min:1',
    proxyQueryParams: 'min:1',
    proxyMethod: 'min:1',
    contentType: 'min:1',
  },
};

const dataModelSchema = joi.array().items(
  joi.object({
    id_tce: joi.string(),
    id_consignment: joi.string().required(),
    id_shipment: joi.string().required(),
    transport_activity: joi.number().required(),
    mass: joi.number().required(),
    mode_of_transport: joi.string().required(),
    asset_type: joi.string().required(),
    load_factor: joi.number().required(),
    empty_distance: joi.number().required(),
    energy_carrier_N: joi.string().required(),
    Feedstock_N: joi.string().required(),
  })
);

export const customMessage = {
  shared: sharedCustomMessage,
};

export const shareFootprintSchema = {
  shared,
  azure: azureSchema,
  http: httpSchema,
  s3: s3Schema,
  dataModel: dataModelSchema,
};
