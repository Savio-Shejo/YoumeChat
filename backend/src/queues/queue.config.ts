import { Queue } from 'bullmq';
import { env } from '../config/env.config';
import { loggers } from '../common/pinoLogger';

const redisConnection = {
  host: env.REDIS_HOST,
  port: Number(env.REDIS_PORT),
  password: env.REDIS_PASSWORD || undefined,
};

export let mediaQueue: Queue | null = null;
export let notificationQueue: Queue | null = null;
export let cleanupQueue: Queue | null = null;

if (env.REDIS_ENABLED) {
  try {
    mediaQueue = new Queue('media-processing', { connection: redisConnection });
    notificationQueue = new Queue('push-notifications', { connection: redisConnection });
    cleanupQueue = new Queue('system-cleanup', { connection: redisConnection });
    loggers.api.info('BullMQ worker queues created successfully.');
  } catch (err: any) {
    loggers.error.warn({ error: err.message }, 'Failed to initialize BullMQ queues.');
  }
}
