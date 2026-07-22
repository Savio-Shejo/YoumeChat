export const SocketEvents = {
  // Connection / Rooms
  JOIN_CHAT: 'join_chat',
  LEAVE_CHAT: 'leave_chat',
  USER_ONLINE: 'online',
  USER_OFFLINE: 'offline',

  // Messages
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  MESSAGE_READ: 'message_read',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_DELETED: 'message_deleted',
  MESSAGE_EDITED: 'message_edited',
  MESSAGE_REACTION: 'message_reaction',

  // Typing indicators
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',

  // System notifications / errors
  ERROR: 'error',
} as const;

export type SocketEvent = (typeof SocketEvents)[keyof typeof SocketEvents];
