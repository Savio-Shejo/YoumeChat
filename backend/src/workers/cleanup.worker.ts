import { Worker, Job } from 'bullmq';
import { env } from '../config/env.config';
import { loggers } from '../common/pinoLogger';
import { UserSession } from '../modules/sessions/userSession.model';

if (env.REDIS_ENABLED) {
  const cleanupWorker = new Worker(
    'system-cleanup',
    async (job: Job) => {
      loggers.api.info({ jobId: job.id }, 'Executing scheduled system cleanup job');
      const now = new Date();
      const result = await UserSession.deleteMany({ expiresAt: { $lt: now } }).exec();
      loggers.api.info({ deletedSessions: result.deletedCount }, 'Cleaned up expired sessions');
    },
    {
      connection: {
        host: env.REDIS_HOST,
        port: Number(env.REDIS_PORT),
        password: env.REDIS_PASSWORD || undefined,
      },
    }
  );
}
