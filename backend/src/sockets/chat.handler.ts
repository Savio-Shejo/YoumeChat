import { Server, Socket } from 'socket.io';
import { SocketEvents } from '../constants/socketEvents';

export const registerChatHandlers = (io: Server, socket: Socket) => {
  const user = socket.data.user;

  socket.on(SocketEvents.JOIN_CHAT, ({ chatId }: { chatId: string }) => {
    socket.join(`chat_${chatId}`);
  });

  socket.on(SocketEvents.LEAVE_CHAT, ({ chatId }: { chatId: string }) => {
    socket.leave(`chat_${chatId}`);
  });

  socket.on(SocketEvents.TYPING, ({ chatId }: { chatId: string }) => {
    socket.to(`chat_${chatId}`).emit(SocketEvents.TYPING, {
      chatId,
      userId: user._id,
      username: user.username,
    });
  });

  socket.on(SocketEvents.STOP_TYPING, ({ chatId }: { chatId: string }) => {
    socket.to(`chat_${chatId}`).emit(SocketEvents.STOP_TYPING, {
      chatId,
      userId: user._id,
      username: user.username,
    });
  });
};
