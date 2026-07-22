import { admin } from '../config/firebase.config';
import { Device } from '../modules/devices/device.model';
import { notificationRepository } from '../repositories/NotificationRepository';
import { loggers } from '../common/pinoLogger';

export class PushNotificationService {
  public async sendNotification(recipientUserId: string, title: string, body: string, payload?: Record<string, any>) {
    try {
      await notificationRepository.createNotification({
        recipient: recipientUserId as any,
        type: 'message',
        title,
        body,
        payload,
      });

      const devices = await Device.find({ user: recipientUserId }).select('fcmToken').exec();
      const tokens = devices.map((d) => d.fcmToken);

      if (!tokens || tokens.length === 0) return;

      if (!admin.apps.length) {
        loggers.api.info({ recipientUserId, title, body }, '[FCM Mock] Push Notification queued');
        return;
      }

      const message: admin.messaging.MulticastMessage = {
        tokens,
        notification: { title, body },
        data: payload ? Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, String(v)])) : {},
      };

      const response = await admin.messaging().sendEachForMulticast(message);
      loggers.api.info({ succeeded: response.successCount, failed: response.failureCount }, 'FCM Push notification dispatched');
    } catch (error) {
      loggers.error.error({ error }, 'Error sending push notification');
    }
  }
}

export const pushNotificationService = new PushNotificationService();
