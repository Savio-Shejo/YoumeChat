import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { TokenPayload } from '../modules/auth/auth.types';
import { userRepository } from '../modules/users/user.repository';
import { SocketEvents } from '../constants/socketEvents';
import { loggers } from '../common/pinoLogger';
import { registerMessageHandlers } from './message.handler';
import { registerCallHandlers } from './call.handler';

export const handleConnection = (io: Server) => {
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      if (!token) {
        return next(new Error('Authentication token required for Socket connection'));
      }

      const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
      const user = await userRepository.findById(decoded.userId);

      if (!user || user.isBanned) {
        return next(new Error('User unauthorized or banned'));
      }

      socket.data.user = user;
      next();
    } catch (err: any) {
      loggers.error.error({ error: err.message }, 'Socket authentication failed');
      next(new Error('Invalid socket authentication token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const user = socket.data.user;
    loggers.socket.info({ userId: user._id, username: user.username }, 'User connected to Socket.IO');

    socket.join(`user_${user._id}`);

    await userRepository.updateOnlineStatus(user._id, true);
    socket.broadcast.emit(SocketEvents.USER_ONLINE, {
      userId: user._id,
      username: user.username,
    });

    // Register message and call signaling socket event handlers
    registerMessageHandlers(io, socket);
    registerCallHandlers(io, socket);

    socket.on('disconnect', async () => {
      loggers.socket.info({ userId: user._id, username: user.username }, 'User disconnected from Socket.IO');
      await userRepository.updateOnlineStatus(user._id, false);
      socket.broadcast.emit(SocketEvents.USER_OFFLINE, {
        userId: user._id,
        username: user.username,
        lastSeen: new Date(),
      });
    });
  });
};
