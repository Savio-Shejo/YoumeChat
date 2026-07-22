import { Chat, IChat } from './chat.model';
import { Types } from 'mongoose';

export class ChatRepository {
  public async findById(id: string | Types.ObjectId): Promise<IChat | null> {
    return Chat.findById(id)
      .populate('participants', 'username displayName avatarUrl isOnline lastSeen')
      .populate('lastMessage')
      .exec();
  }

  public async findPrivateChat(userA: string, userB: string): Promise<IChat | null> {
    return Chat.findOne({
      type: 'private',
      participants: { $all: [new Types.ObjectId(userA), new Types.ObjectId(userB)] },
    })
      .populate('participants', 'username displayName avatarUrl isOnline lastSeen')
      .populate('lastMessage')
      .exec();
  }

  public async createChat(chatData: Partial<IChat>): Promise<IChat> {
    const chat = new Chat(chatData);
    const saved = await chat.save();
    return saved.populate('participants', 'username displayName avatarUrl isOnline lastSeen');
  }

  public async getUserChats(
    userId: string,
    limit: number = 20,
    page: number = 1
  ): Promise<{ chats: IChat[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter = { participants: new Types.ObjectId(userId) };

    const [chats, total] = await Promise.all([
      Chat.find(filter)
        .populate('participants', 'username displayName avatarUrl isOnline lastSeen')
        .populate('lastMessage')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Chat.countDocuments(filter),
    ]);

    return { chats, total };
  }

  public async updateLastMessage(chatId: string | Types.ObjectId, messageId: string | Types.ObjectId): Promise<IChat | null> {
    return Chat.findByIdAndUpdate(chatId, { lastMessage: messageId }, { new: true }).exec();
  }

  public async togglePin(chatId: string, userId: string): Promise<IChat | null> {
    const chat = await Chat.findById(chatId);
    if (!chat) return null;

    const uId = new Types.ObjectId(userId);
    const exists = chat.pinnedBy.some((id: Types.ObjectId) => id.equals(uId));

    if (exists) {
      chat.pinnedBy = chat.pinnedBy.filter((id: Types.ObjectId) => !id.equals(uId));
    } else {
      chat.pinnedBy.push(uId);
    }
    return chat.save();
  }

  public async toggleMute(chatId: string, userId: string): Promise<IChat | null> {
    const chat = await Chat.findById(chatId);
    if (!chat) return null;

    const uId = new Types.ObjectId(userId);
    const exists = chat.isMutedBy.some((id: Types.ObjectId) => id.equals(uId));

    if (exists) {
      chat.isMutedBy = chat.isMutedBy.filter((id: Types.ObjectId) => !id.equals(uId));
    } else {
      chat.isMutedBy.push(uId);
    }
    return chat.save();
  }

  public async toggleArchive(chatId: string, userId: string): Promise<IChat | null> {
    const chat = await Chat.findById(chatId);
    if (!chat) return null;

    const uId = new Types.ObjectId(userId);
    const exists = chat.isArchivedBy.some((id: Types.ObjectId) => id.equals(uId));

    if (exists) {
      chat.isArchivedBy = chat.isArchivedBy.filter((id: Types.ObjectId) => !id.equals(uId));
    } else {
      chat.isArchivedBy.push(uId);
    }
    return chat.save();
  }

  public async incrementUnread(chatId: string | Types.ObjectId, recipientIds: string[]): Promise<void> {
    const updateObj: Record<string, number> = {};
    for (const rId of recipientIds) {
      updateObj[`unreadCounts.${rId}`] = 1;
    }
    await Chat.findByIdAndUpdate(chatId, { $inc: updateObj }).exec();
  }

  public async resetUnread(chatId: string | Types.ObjectId, userId: string): Promise<void> {
    const updateObj: Record<string, number> = {};
    updateObj[`unreadCounts.${userId}`] = 0;
    await Chat.findByIdAndUpdate(chatId, { $set: updateObj }).exec();
  }

  public async deleteChat(chatId: string): Promise<boolean> {
    const res = await Chat.findByIdAndDelete(chatId).exec();
    return !!res;
  }
}

export const chatRepository = new ChatRepository();
