import { createClient } from 'redis';
import { promisify } from 'util';
import { REDIS_URL } from 'utils/settings';

const redisClient = createClient({
  url: REDIS_URL,
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

    if (expiresInSeconds) {
      await redisAsync.expire(key, expiresInSeconds);
    }
  }
  public static async retrieve(key: string) {
    console.log('Retrieving data with key=', key, '.....');
    const data = await redisClient.get(key);
    if (!data) return null;

    return JSON.parse(data);
  }
}

export type CacheServiceType = typeof CacheService;
