import { ApiServer } from './api';
import 'sfc-unit/infrastructure/db';
const apiAllowedOrigins = process.env.API_ALLOWED_ORIGINS || '';
const allowedOrigins = apiAllowedOrigins.split(',').filter(Boolean);
export const apiServer = ApiServer.create({
  cors: {
    allowedOrigins,
  },
});

const apiPort = process.env.API_PORT || 3000;

apiServer.listen(apiPort as number);
console.log(`Listening on http://0.0.0.0:${apiPort}`);
