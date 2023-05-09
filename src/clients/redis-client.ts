import { createClient } from 'redis';
import { promisify } from 'util';
import { AppLogger } from 'utils/logger';
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

const logger = new AppLogger('CacheService');
export class CacheService {
  public static async storeItem(
    key: string,
    data: object,
    expiresInSeconds = -1
  ) {
    logger.info('Caching data...');
    await redisAsync.set(key, JSON.stringify(data));

    if (expiresInSeconds > 0) {
      await redisAsync.expire(key, expiresInSeconds);
    }

    logger.info('Successfully cached data.');
  }
  public static async retrieve(key: string) {
    logger.info('Retrieving data...');
    const data = await redisAsync.get(key);

    if (!data) {
      logger.warn('Key not found');
      return null;
    }

    const storedObject = JSON.parse(data);

    logger.info('Successfuly retrieved data from cache');
    return storedObject;
  }
}

export type CacheServiceType = typeof CacheService;
