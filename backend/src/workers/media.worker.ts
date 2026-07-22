import { Worker, Job } from 'bullmq';
import { env } from '../config/env.config';
import { loggers } from '../common/pinoLogger';

if (env.REDIS_ENABLED) {
  const mediaWorker = new Worker(
    'media-processing',
    async (job: Job) => {
      loggers.api.info({ jobId: job.id, data: job.data }, 'Processing media job (compression & thumbnail)');
      return { success: true, processedUrl: job.data.url };
    },
    {
      connection: {
        host: env.REDIS_HOST,
        port: Number(env.REDIS_PORT),
        password: env.REDIS_PASSWORD || undefined,
      },
    }
  );

  mediaWorker.on('completed', (job: Job) => {
    loggers.api.info({ jobId: job.id }, 'Media processing job completed');
  });

  mediaWorker.on('failed', (job: Job | undefined, err: Error) => {
    loggers.error.error({ jobId: job?.id, error: err.message }, 'Media processing job failed');
  });
}
