import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisClient } from '../config/redis.config';
import { env } from '../config/env.config';
import { handleConnection } from './connection.handler';
import { registerChatHandlers } from './chat.handler';
import { registerMessageHandlers } from './message.handler';
import { registerCallHandlers } from './call.handler';
import { loggers } from '../common/pinoLogger';

export const initSockets = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(','),
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  if (redisClient && env.REDIS_ENABLED) {
    const pubClient = redisClient;
    const subClient = pubClient.duplicate();
    io.adapter(createAdapter(pubClient, subClient));
    loggers.socket.info('Socket.IO Redis adapter attached for horizontal scaling.');
  }

  handleConnection(io);

  io.on('connection', (socket: Socket) => {
    registerChatHandlers(io, socket);
    registerMessageHandlers(io, socket);
    registerCallHandlers(io, socket);
  });

  return io;
};
