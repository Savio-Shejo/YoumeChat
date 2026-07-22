import { userRepository } from '../src/modules/users/user.repository';
import { chatRepository } from '../src/modules/chats/chat.repository';
import { User } from '../src/modules/users/user.model';
import { Chat } from '../src/modules/chats/chat.model';

describe('Repository Layer Unit Tests', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('UserRepository.findByUsername should return user model or null', async () => {
    jest.spyOn(User, 'findOne').mockReturnValue({
      exec: jest.fn().mockResolvedValue({ _id: '123', username: 'testuser' }),
    } as any);

    const user = await userRepository.findByUsername('testuser');
    expect(user).not.toBeNull();
    expect(user?.username).toBe('testuser');
  });

  it('ChatRepository.findById should populate participants and lastMessage', async () => {
    jest.spyOn(Chat, 'findById').mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue({ _id: 'chat123', type: 'private' }),
    } as any);

    const chat = await chatRepository.findById('chat123');
    expect(chat).not.toBeNull();
    expect(chat?.type).toBe('private');
  });
});
