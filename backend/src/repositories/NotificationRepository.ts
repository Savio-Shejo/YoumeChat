import { Notification, INotification } from '../models/Notification';

export class NotificationRepository {
  public async createNotification(notificationData: Partial<INotification>): Promise<INotification> {
    const notification = new Notification(notificationData);
    return notification.save();
  }

  public async getUserNotifications(userId: string, limit: number = 20, page: number = 1): Promise<{ notifications: INotification[]; total: number }> {
    const filter = { recipient: userId };
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate('sender', 'username displayName avatarUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Notification.countDocuments(filter),
    ]);

    return { notifications, total };
  }

  public async markAsRead(notificationId: string, userId: string): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    ).exec();
  }

  public async markAllAsRead(userId: string): Promise<void> {
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true }).exec();
  }
}

export const notificationRepository = new NotificationRepository();
