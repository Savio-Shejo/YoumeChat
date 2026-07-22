import { messageRepository } from './message.repository';
import { chatRepository } from '../chats/chat.repository';
import { chatService } from '../chats/chat.service';
import { pushNotificationService } from '../../services/PushNotificationService';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/statusCodes';
import { ErrorCodes } from '../../constants/errorCodes';
import { MessageType } from './message.model';

export interface SendMessageDto {
  chatId: string;
  senderId: string;
  type?: MessageType;
  content?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  location?: { latitude: number; longitude: number; title?: string };
  replyToMessageId?: string;
  forwardedFromId?: string;
}

export class MessageService {
  public async sendMessage(dto: SendMessageDto) {
    const chat = await chatService.getChatById(dto.chatId, dto.senderId);

    const message = await messageRepository.createMessage({
      chat: chat._id as any,
      sender: dto.senderId as any,
      type: dto.type || 'text',
      content: dto.content,
      mediaUrl: dto.mediaUrl,
      thumbnailUrl: dto.thumbnailUrl,
      fileName: dto.fileName,
      fileSize: dto.fileSize,
      duration: dto.duration,
      location: dto.location,
      replyToMessage: dto.replyToMessageId as any,
      forwardedFrom: dto.forwardedFromId as any,
      deliveryStatus: 'sent',
    });

    const recipientIds = chat.participants
      .map((p: any) => p._id?.toString() || p.toString())
      .filter((id: string) => id !== dto.senderId);

    // Execute lastMessage update and unread counter increments concurrently
    await Promise.all([
      chatRepository.updateLastMessage(chat._id, message._id),
      chatRepository.incrementUnread(chat._id, recipientIds),
    ]);

    // Dispatch push notifications asynchronously in background without blocking instant message delivery
    for (const recipientId of recipientIds) {
      pushNotificationService
        .sendNotification(
          recipientId,
          'New Message',
          dto.content || `Sent a ${dto.type || 'message'}`,
          { chatId: dto.chatId, messageId: message._id.toString() }
        )
        .catch(() => {});
    }

    return message;
  }

  public async getChatMessages(chatId: string, userId: string, limit: number, beforeDate?: string) {
    await chatService.getChatById(chatId, userId);
    const parsedDate = beforeDate ? new Date(beforeDate) : undefined;
    return messageRepository.getChatMessages(chatId, userId, limit, parsedDate);
  }

  public async editMessage(messageId: string, userId: string, newContent: string) {
    const message = await messageRepository.findById(messageId);
    if (!message) {
      throw new AppError('Message not found', HttpStatus.NOT_FOUND, ErrorCodes.MESSAGE_NOT_FOUND);
    }

    if (message.sender._id.toString() !== userId) {
      throw new AppError('You can only edit your own messages', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
    }

    return messageRepository.editMessage(messageId, newContent);
  }

  public async toggleReaction(messageId: string, userId: string, emoji: string) {
    const message = await messageRepository.findById(messageId);
    if (!message) {
      throw new AppError('Message not found', HttpStatus.NOT_FOUND, ErrorCodes.MESSAGE_NOT_FOUND);
    }

    return messageRepository.toggleReaction(messageId, userId, emoji);
  }

  public async deleteForMe(messageId: string, userId: string) {
    return messageRepository.deleteForMe(messageId, userId);
  }

  public async deleteForEveryone(messageId: string, userId: string) {
    const message = await messageRepository.findById(messageId);
    if (!message) {
      throw new AppError('Message not found', HttpStatus.NOT_FOUND, ErrorCodes.MESSAGE_NOT_FOUND);
    }

    if (message.sender._id.toString() !== userId) {
      throw new AppError('You can only delete your own messages for everyone', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
    }

    return messageRepository.deleteForEveryone(messageId);
  }
}

export const messageService = new MessageService();
