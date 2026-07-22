import { RefreshToken, IRefreshToken } from './refreshToken.model';
import { UserSession } from '../sessions/userSession.model';
import { Types } from 'mongoose';

export class AuthRepository {
  public async createRefreshToken(userId: string | Types.ObjectId, token: string, deviceId?: string): Promise<IRefreshToken> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    return RefreshToken.create({
      user: userId,
      token,
      deviceId,
      expiresAt,
    });
  }

  public async findRefreshToken(token: string): Promise<IRefreshToken | null> {
    return RefreshToken.findOne({ token }).exec();
  }

  public async deleteRefreshToken(token: string): Promise<boolean> {
    const res = await RefreshToken.deleteOne({ token }).exec();
    return (res.deletedCount || 0) > 0;
  }

  public async deleteAllRefreshTokens(userId: string | Types.ObjectId): Promise<number> {
    const res = await RefreshToken.deleteMany({ user: userId }).exec();
    await UserSession.updateMany({ user: userId }, { isRevoked: true }).exec();
    return res.deletedCount || 0;
  }

  public async revokeSession(sessionId: string, userId: string | Types.ObjectId): Promise<boolean> {
    const res = await UserSession.findOneAndUpdate(
      { sessionId, user: userId },
      { isRevoked: true },
      { new: true }
    ).exec();
    return !!res;
  }
}

export const authRepository = new AuthRepository();
