import { redisAsync } from 'clients';
import { ICacheService } from 'core/usecases/interfaces';
import { AppLogger } from 'utils/logger';

const logger = new AppLogger('CacheService');

class CacheService implements ICacheService {
  public async storeItem(key: string, data: object, expiresInSeconds = -1) {
    logger.info('Caching data...');
    await redisAsync.set(key, JSON.stringify(data));

    if (expiresInSeconds > 0) {
      await redisAsync.expire(key, expiresInSeconds);
    }

    logger.info('Successfully cached data.');
  }
  public async retrieve(key: string) {
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

export const cacheService = new CacheService();
