import { Server, Socket } from 'socket.io';
import { SocketEvents } from '../constants/socketEvents';
import { messageService } from '../modules/messages/message.service';
import { messageRepository } from '../modules/messages/message.repository';
import { loggers } from '../common/pinoLogger';

export const registerMessageHandlers = (io: Server, socket: Socket) => {
  const user = socket.data.user;

  // Handle message sending (support both send_message and message:send)
  const handleSendMessage = async (data: any, callback?: Function) => {
    try {
      const message = await messageService.sendMessage({
        ...data,
        senderId: user._id.toString(),
      });

      // Broadcast to room under both event names for maximum client compatibility
      io.to(`chat_${data.chatId}`).emit(SocketEvents.RECEIVE_MESSAGE, message);
      io.to(`chat_${data.chatId}`).emit('message:new', message);

      if (callback) callback({ success: true, data: message });
    } catch (err: any) {
      loggers.error.error({ error: err.message }, 'Socket send message error');
      if (callback) callback({ success: false, error: err.message });
    }
  };

  socket.on(SocketEvents.SEND_MESSAGE, handleSendMessage);
  socket.on('message:send', handleSendMessage);

  // Handle typing events
  socket.on('typing:start', ({ chatId }: { chatId: string }) => {
    socket.to(`chat_${chatId}`).emit('typing:start', {
      chatId,
      userId: user._id,
      username: user.username,
      displayName: user.displayName,
    });
  });

  socket.on('typing:stop', ({ chatId }: { chatId: string }) => {
    socket.to(`chat_${chatId}`).emit('typing:stop', {
      chatId,
      userId: user._id,
    });
  });

  // Handle read receipts
  const handleMessageRead = async ({ chatId }: { chatId: string }) => {
    await messageRepository.markAsRead(chatId, user._id.toString());
    io.to(`chat_${chatId}`).emit(SocketEvents.MESSAGE_READ, {
      chatId,
      userId: user._id,
    });
    io.to(`chat_${chatId}`).emit('read:receipt', {
      chatId,
      userId: user._id,
    });
  };

  socket.on(SocketEvents.MESSAGE_READ, handleMessageRead);
  socket.on('read:receipt', handleMessageRead);

  // Handle deletion
  socket.on(
    SocketEvents.MESSAGE_DELETED,
    async ({ messageId, chatId, forEveryone }: { messageId: string; chatId: string; forEveryone: boolean }) => {
      if (forEveryone) {
        await messageService.deleteForEveryone(messageId, user._id.toString());
        io.to(`chat_${chatId}`).emit(SocketEvents.MESSAGE_DELETED, {
          messageId,
          chatId,
          forEveryone: true,
        });
        io.to(`chat_${chatId}`).emit('message:deleted', {
          messageId,
          chatId,
          forEveryone: true,
        });
      } else {
        await messageService.deleteForMe(messageId, user._id.toString());
      }
    }
  );
};
