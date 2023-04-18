const shared = {
  shipmentId: 'required|min:2',
  contentType: 'in:application/json,text/csv',
  type: 'required|in:azure,s3,http',
  dataLocation: 'required|present',
};

const sharedCustomMessage = {
  'in.type':
    "The only data types that are allowed are 'azure', 's3' and 'http'",
  'in.contentType':
    "The allowed content Types are 'application/json' and 'text/csv'",
  'data.present': 'You need to specify the data object',
};

const s3Schema = {
  dataLocation: {
    name: 'required|min:1',
    bucketName: 'required|min:1|string',
    keyName: 'min:4|string',
    filename: 'min:3',
    region: 'required|min:1',
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

export const customMessage = {
  shared: sharedCustomMessage,
};

export const shareFootprintSchema = {
  shared,
  azure: azureSchema,
  http: httpSchema,
  s3: s3Schema,
};
