import { User } from '../users/user.model';
import { Message } from '../../models/Message';
import { loggers } from '../../common/pinoLogger';

export interface ISearchProvider {
  searchUsers(query: string, limit?: number): Promise<any[]>;
  searchMessages(query: string, chatId?: string, limit?: number): Promise<any[]>;
}

export class AtlasSearchProvider implements ISearchProvider {
  public async searchUsers(query: string, limit: number = 20): Promise<any[]> {
    const searchRegex = new RegExp(query, 'i');
    return User.find({
      isBanned: false,
      $or: [{ username: searchRegex }, { displayName: searchRegex }, { email: searchRegex }],
    })
      .limit(limit)
      .select('-blockedUsers')
      .exec();
  }

  public async searchMessages(query: string, chatId?: string, limit: number = 20): Promise<any[]> {
    const filter: any = { content: new RegExp(query, 'i'), isDeletedForEveryone: false };
    if (chatId) filter.chat = chatId;

    return Message.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('sender', 'username displayName avatarUrl')
      .exec();
  }
}

export class SearchService {
  private provider: ISearchProvider;

  constructor(provider?: ISearchProvider) {
    this.provider = provider || new AtlasSearchProvider();
  }

  public async searchUsers(query: string, limit?: number) {
    loggers.api.info({ query, limit }, 'Executing user search');
    return this.provider.searchUsers(query, limit);
  }

  public async searchMessages(query: string, chatId?: string, limit?: number) {
    loggers.api.info({ query, chatId, limit }, 'Executing message search');
    return this.provider.searchMessages(query, chatId, limit);
  }
}

export const searchService = new SearchService();
