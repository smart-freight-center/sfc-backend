import { ApiServer } from 'api';

const server = ApiServer.create({});

const testServer = server.koa.listen();

export { testServer };
