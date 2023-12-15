import { AppLogger } from 'utils/logger';
import { server } from './api';
import 'clients/redis-client';

const logger = new AppLogger('RootServer');
const apiPort = process.env.API_PORT || 3000;

server.listen(apiPort, () => {
  logger.info(`Listening on http://0.0.0.0:${apiPort}`, { apiPort });
});
