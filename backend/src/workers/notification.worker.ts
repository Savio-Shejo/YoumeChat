import { Worker, Job } from 'bullmq';
import { env } from '../config/env.config';
import { loggers } from '../common/pinoLogger';
import { pushNotificationService } from '../services/PushNotificationService';

if (env.REDIS_ENABLED) {
  const notificationWorker = new Worker(
    'push-notifications',
    async (job: Job) => {
      const { recipientUserId, title, body, payload } = job.data;
      loggers.api.info({ recipientUserId, title }, 'Processing background push notification');
      await pushNotificationService.sendNotification(recipientUserId, title, body, payload);
    },
    {
      connection: {
        host: env.REDIS_HOST,
        port: Number(env.REDIS_PORT),
        password: env.REDIS_PASSWORD || undefined,
      },
    }
  );

  notificationWorker.on('completed', (job: Job) => {
    loggers.api.info({ jobId: job.id }, 'Notification job completed');
  });
}
