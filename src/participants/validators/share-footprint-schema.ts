const shared = {
  shipmentId: 'required|min:2',
  type: 'required|enum:azure,s3,http',
};
const s3Schema = {
  data: {
    name: 'min:1',
    bucketName: 'min:1|string',
    accessKeyId: 'min:1',
    secretAccessKey: 'min:1|string',
  },
};
const azureSchema = {
  data: {
    container: 'min:1|string',
    account: 'min:1',
    blobname: 'min:1|string',
  },
};
const httpSchema = {
  data: {
    name: 'min:1|required',
    path: 'min:1',
    method: 'min:1',
    baseUrl: 'min:1',
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

export const shareFootprintSchema = {
  shared,
  azure: azureSchema,
  http: httpSchema,
  s3: s3Schema,
};
