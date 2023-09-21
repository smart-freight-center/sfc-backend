import { server } from './api';
import 'clients/redis-client';

const apiPort = process.env.API_PORT || 3000;

server.listen(apiPort, () => {
  console.log(`Listening on http://0.0.0.0:${apiPort}`);
});
