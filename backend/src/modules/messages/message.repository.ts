import { Message, IMessage, IReaction } from './message.model';
import { Types } from 'mongoose';

export class MessageRepository {
  public async findById(id: string | Types.ObjectId): Promise<IMessage | null> {
    return Message.findById(id)
      .populate('sender', 'username displayName avatarUrl')
      .populate('replyToMessage')
      .populate('forwardedFrom')
      .exec();
  }

  public async createMessage(messageData: Partial<IMessage>): Promise<IMessage> {
    const message = new Message(messageData);
    const saved = await message.save();
    return saved.populate('sender', 'username displayName avatarUrl');
  }

  public async getChatMessages(
    chatId: string,
    userId: string,
    limit: number = 50,
    beforeDate?: Date
  ): Promise<IMessage[]> {
    const filter: any = {
      chat: new Types.ObjectId(chatId),
      deletedFor: { $ne: new Types.ObjectId(userId) },
    };

    if (beforeDate) {
      filter.createdAt = { $lt: beforeDate };
    }

    return Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'username displayName avatarUrl')
      .populate('replyToMessage')
      .populate('forwardedFrom')
      .exec();
  }

  public async editMessage(messageId: string, newContent: string): Promise<IMessage | null> {
    const message = await Message.findById(messageId);
    if (!message || message.isDeletedForEveryone) return null;

    message.edits.push({ content: message.content || '', editedAt: new Date() });
    message.content = newContent;
    return message.save();
  }

  public async toggleReaction(messageId: string, userId: string, emoji: string): Promise<IMessage | null> {
    const message = await Message.findById(messageId);
    if (!message || message.isDeletedForEveryone) return null;

    const uId = new Types.ObjectId(userId);
    const existingIndex = message.reactions.findIndex((r: IReaction) => r.user.equals(uId));

    if (existingIndex > -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        message.reactions.splice(existingIndex, 1);
      } else {
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      message.reactions.push({ user: uId, emoji });
    }

    return message.save();
  }

  public async deleteForMe(messageId: string, userId: string): Promise<IMessage | null> {
    return Message.findByIdAndUpdate(
      messageId,
      { $addToSet: { deletedFor: new Types.ObjectId(userId) } },
      { new: true }
    ).exec();
  }

  public async deleteForEveryone(messageId: string): Promise<IMessage | null> {
    return Message.findByIdAndUpdate(
      messageId,
      { isDeletedForEveryone: true, content: 'This message was deleted.', mediaUrl: undefined },
      { new: true }
    ).exec();
  }

  public async markAsDelivered(messageIds: string[], userId: string): Promise<void> {
    await Message.updateMany(
      { _id: { $in: messageIds.map((id) => new Types.ObjectId(id)) } },
      {
        $addToSet: { deliveredTo: new Types.ObjectId(userId) },
        $set: { deliveryStatus: 'delivered' },
      }
    ).exec();
  }

  public async markAsRead(chatId: string, userId: string): Promise<void> {
    await Message.updateMany(
      { chat: new Types.ObjectId(chatId), readBy: { $ne: new Types.ObjectId(userId) } },
      {
        $addToSet: { readBy: new Types.ObjectId(userId) },
        $set: { deliveryStatus: 'read' },
      }
    ).exec();
  }

  public async deleteChatMessages(chatId: string): Promise<number> {
    const res = await Message.deleteMany({ chat: new Types.ObjectId(chatId) }).exec();
    return res.deletedCount || 0;
  }
}

export const messageRepository = new MessageRepository();
