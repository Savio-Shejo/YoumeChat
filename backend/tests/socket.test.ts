import { handleConnection } from '../src/sockets/connection.handler';
import { SocketEvents } from '../src/constants/socketEvents';

describe('Socket.IO Events Unit Tests', () => {
  it('SocketEvents constants should match expected real-time event names', () => {
    expect(SocketEvents.JOIN_CHAT).toBe('join_chat');
    expect(SocketEvents.LEAVE_CHAT).toBe('leave_chat');
    expect(SocketEvents.SEND_MESSAGE).toBe('send_message');
    expect(SocketEvents.RECEIVE_MESSAGE).toBe('receive_message');
    expect(SocketEvents.TYPING).toBe('typing');
    expect(SocketEvents.STOP_TYPING).toBe('stop_typing');
  });

  it('handleConnection function should be defined', () => {
    expect(handleConnection).toBeDefined();
    expect(typeof handleConnection).toBe('function');
  });
});
