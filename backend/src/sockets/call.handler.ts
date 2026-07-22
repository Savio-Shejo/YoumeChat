import { Server, Socket } from 'socket.io';
import { SocketEvents } from '../constants/socketEvents';
import { loggers } from '../common/pinoLogger';

export const registerCallHandlers = (io: Server, socket: Socket) => {
  const user = socket.data.user;

  // Handle call invitation (voice or video)
  socket.on('call:invite', (data: { targetUserId: string; offer: any; callType: 'voice' | 'video' }) => {
    loggers.socket.info({ callerId: user._id, targetUserId: data.targetUserId, callType: data.callType }, 'WebRTC Call Invite sent');
    io.to(`user_${data.targetUserId}`).emit('call:invite', {
      callerId: user._id.toString(),
      callerName: user.displayName || user.username,
      callerAvatar: user.avatarUrl,
      offer: data.offer,
      callType: data.callType,
    });
  });

  // Handle call acceptance
  socket.on('call:accept', (data: { callerId: string; answer: any }) => {
    loggers.socket.info({ answererId: user._id, callerId: data.callerId }, 'WebRTC Call Accepted');
    io.to(`user_${data.callerId}`).emit('call:accept', {
      answererId: user._id.toString(),
      answer: data.answer,
    });
  });

  // Handle call rejection
  socket.on('call:reject', (data: { callerId: string; reason?: string }) => {
    loggers.socket.info({ rejecterId: user._id, callerId: data.callerId }, 'WebRTC Call Rejected');
    io.to(`user_${data.callerId}`).emit('call:reject', {
      rejecterId: user._id.toString(),
      reason: data.reason || 'User declined call',
    });
  });

  // Handle ICE Candidates exchange
  socket.on('call:ice_candidate', (data: { targetUserId: string; candidate: any }) => {
    io.to(`user_${data.targetUserId}`).emit('call:ice_candidate', {
      senderId: user._id.toString(),
      candidate: data.candidate,
    });
  });

  // Handle call termination
  socket.on('call:end', (data: { targetUserId: string }) => {
    loggers.socket.info({ enderId: user._id, targetUserId: data.targetUserId }, 'WebRTC Call Ended');
    io.to(`user_${data.targetUserId}`).emit('call:end', {
      enderId: user._id.toString(),
    });
  });
};
