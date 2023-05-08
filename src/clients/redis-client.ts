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

export class CacheService {
  public static async storeItem(
    key: string,
    data: object,
    expiresInSeconds = -1
  ) {
    await redisAsync.set(key, JSON.stringify(data));

    console.log('Got here...');
    if (expiresInSeconds > 0) {
      await redisAsync.expire(key, expiresInSeconds);
    }
  }
  public static async retrieve(key: string) {
    console.log('Retrieving data with key=', key, '.....');
    const data = await redisAsync.get(key);

    if (!data) return null;

    return JSON.parse(data);
  }
}

export type CacheServiceType = typeof CacheService;
