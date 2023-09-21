import { createClient } from 'redis';
import { promisify } from 'util';
import {
  REDIS_HOST,
  REDIS_PORT,
  REDIS_PASSWORD,
  REDIS_DB,
} from 'utils/settings';

const redisCredentials = REDIS_PASSWORD ? `:${REDIS_PASSWORD}@` : '';

const redisConnectionString = `redis://${redisCredentials}${REDIS_HOST}:${REDIS_PORT}/${REDIS_DB}`;

const redisClient = createClient({
  url: redisConnectionString,
  legacyMode: true,
});

redisClient.connect();

export const redisAsync = {
  get: promisify(redisClient.GET).bind(redisClient),
  set: promisify(redisClient.set).bind(redisClient),
  hget: promisify(redisClient.hGet).bind(redisClient),
  hgetall: promisify(redisClient.hGetAll).bind(redisClient),
  hincrby: promisify(redisClient.hIncrBy).bind(redisClient),
  hset: promisify(redisClient.hSet).bind(redisClient),
  expire: promisify(redisClient.expire).bind(redisClient),
};
