import { chatRepository } from '../repositories/ChatRepository';
import { userRepository } from '../repositories/UserRepository';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../constants/statusCodes';
import { ErrorCodes } from '../constants/errorCodes';

export class ChatService {
  public async getOrCreatePrivateChat(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new AppError('Cannot create a chat with yourself', HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
    }

    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCodes.USER_NOT_FOUND);
    }

    let chat = await chatRepository.findPrivateChat(currentUserId, targetUserId);
    if (!chat) {
      chat = await chatRepository.createChat({
        type: 'private',
        participants: [currentUserId, targetUserId] as any,
      });
    }

    return chat;
  }

  public async getUserChats(userId: string, limit: number, page: number) {
    return chatRepository.getUserChats(userId, limit, page);
  }

  public async getChatById(chatId: string, userId: string) {
    const chat = await chatRepository.findById(chatId);
    if (!chat) {
      throw new AppError('Chat not found', HttpStatus.NOT_FOUND, ErrorCodes.CHAT_NOT_FOUND);
    }

    const isParticipant = chat.participants.some((p: any) => p._id.toString() === userId || p.toString() === userId);
    if (!isParticipant) {
      throw new AppError('You are not a participant in this chat', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
    }

    return chat;
  }

  public async togglePinChat(chatId: string, userId: string) {
    const chat = await this.getChatById(chatId, userId);
    return chatRepository.togglePin(chat._id.toString(), userId);
  }

  public async toggleMuteChat(chatId: string, userId: string) {
    const chat = await this.getChatById(chatId, userId);
    return chatRepository.toggleMute(chat._id.toString(), userId);
  }

  public async toggleArchiveChat(chatId: string, userId: string) {
    const chat = await this.getChatById(chatId, userId);
    return chatRepository.toggleArchive(chat._id.toString(), userId);
  }

  public async markAsRead(chatId: string, userId: string) {
    await this.getChatById(chatId, userId);
    await chatRepository.resetUnread(chatId, userId);
  }
}

export const chatService = new ChatService();
