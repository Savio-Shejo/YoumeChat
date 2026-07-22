import { redisClient } from '../config/redis.config';
import { loggers } from './pinoLogger';

export class RedisCacheService {
  private static readonly PRESENCE_PREFIX = 'presence:';
  private static readonly TYPING_PREFIX = 'typing:';
  private static readonly SESSION_PREFIX = 'session:';
  private static readonly RECENT_MESSAGES_PREFIX = 'recent_msg:';

  public static async setUserOnline(userId: string, isOnline: boolean): Promise<void> {
    if (!redisClient) return;
    try {
      const key = `${this.PRESENCE_PREFIX}${userId}`;
      if (isOnline) {
        await redisClient.set(key, 'online', 'EX', 86400); // 24 hours TTL
      } else {
        await redisClient.del(key);
      }
    } catch (err: any) {
      loggers.error.error({ error: err.message }, 'Redis setUserOnline error');
    }
  }

  public static async getUserOnline(userId: string): Promise<boolean> {
    if (!redisClient) return false;
    try {
      const val = await redisClient.get(`${this.PRESENCE_PREFIX}${userId}`);
      return val === 'online';
    } catch (err) {
      return false;
    }
  }

  public static async setTyping(chatId: string, userId: string, isTyping: boolean): Promise<void> {
    if (!redisClient) return;
    try {
      const key = `${this.TYPING_PREFIX}${chatId}:${userId}`;
      if (isTyping) {
        await redisClient.set(key, 'typing', 'EX', 10); // 10 seconds TTL
      } else {
        await redisClient.del(key);
      }
    } catch (err: any) {
      loggers.error.error({ error: err.message }, 'Redis setTyping error');
    }
  }

  public static async cacheSession(sessionId: string, sessionData: any, ttlSeconds: number = 2592000): Promise<void> {
    if (!redisClient) return;
    try {
      await redisClient.set(`${this.SESSION_PREFIX}${sessionId}`, JSON.stringify(sessionData), 'EX', ttlSeconds);
    } catch (err: any) {
      loggers.error.error({ error: err.message }, 'Redis cacheSession error');
    }
  }

  public static async getCachedSession(sessionId: string): Promise<any | null> {
    if (!redisClient) return null;
    try {
      const data = await redisClient.get(`${this.SESSION_PREFIX}${sessionId}`);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      return null;
    }
  }

  public static async invalidateSession(sessionId: string): Promise<void> {
    if (!redisClient) return;
    try {
      await redisClient.del(`${this.SESSION_PREFIX}${sessionId}`);
    } catch (err) {}
  }
}
