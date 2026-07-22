import Redis from 'ioredis';
import { env } from './env.config';
import { logger } from '../utils/logger';

let redisClient: Redis | null = null;

if (env.REDIS_ENABLED) {
  try {
    redisClient = new Redis({
      host: env.REDIS_HOST,
      port: Number(env.REDIS_PORT),
      password: env.REDIS_PASSWORD || undefined,
      lazyConnect: true,
      maxRetriesPerRequest: 3,
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected successfully');
    });

    redisClient.on('error', (err) => {
      logger.warn('Redis client connection error (degraded performance mode active):', err.message);
    });
  } catch (err: any) {
    logger.warn('Failed to initialize Redis client:', err.message);
    redisClient = null;
  }
} else {
  logger.info('Redis is disabled by environment configuration.');
}

export { redisClient };
