import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env.config';
import { admin } from '../../config/firebase.config';
import { userRepository } from '../users/user.repository';
import { authRepository } from './auth.repository';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/statusCodes';
import { ErrorCodes } from '../../constants/errorCodes';
import { IUser } from '../users/user.model';
import { loggers } from '../../common/pinoLogger';
import { TokenPayload, AuthTokens, FirebaseUserInfo } from './auth.types';

export class AuthService {
  public async verifyGoogleTokenAndLogin(idToken: string, deviceId?: string): Promise<{ user: IUser; tokens: AuthTokens }> {
    let firebaseUser: FirebaseUserInfo;

    if (process.env.NODE_ENV === 'test' && idToken.startsWith('mock_token_')) {
      const mockUid = idToken.replace('mock_token_', '');
      firebaseUser = {
        uid: mockUid,
        email: `${mockUid.toLowerCase()}@test.com`,
        name: `Test User ${mockUid}`,
        picture: `https://avatar.iran.liara.run/username?username=${mockUid}`,
      };
    } else {
      try {
        if (!admin.apps.length) {
          throw new Error('Firebase Admin SDK is not initialized.');
        }
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        firebaseUser = {
          uid: decodedToken.uid,
          email: decodedToken.email || `${decodedToken.uid}@youmechat.app`,
          name: decodedToken.name || decodedToken.email?.split('@')[0] || 'Youme User',
          picture: decodedToken.picture || '',
        };
      } catch (err: any) {
        loggers.error.error({ error: err.message }, 'Firebase token verification error');
        throw new AppError('Invalid Google IdToken', HttpStatus.UNAUTHORIZED, ErrorCodes.INVALID_TOKEN);
      }
    }

    let user = await userRepository.findByFirebaseUid(firebaseUser.uid);

    if (!user) {
      let baseUsername = (firebaseUser.name || 'user').toLowerCase().replace(/[^a-z0-9_]/g, '');
      if (baseUsername.length < 3) baseUsername = 'user_' + Math.random().toString(36).substring(2, 6);

      let username = baseUsername;
      let counter = 1;
      while (await userRepository.findByUsername(username)) {
        username = `${baseUsername}${counter}`;
        counter++;
      }

      user = await userRepository.create({
        firebaseUid: firebaseUser.uid,
        email: firebaseUser.email,
        username,
        displayName: firebaseUser.name || username,
        avatarUrl: firebaseUser.picture || '',
        isOnline: true,
      });
    }

    if (user.isBanned) {
      throw new AppError('Your account has been banned.', HttpStatus.FORBIDDEN, ErrorCodes.USER_BANNED);
    }

    const tokens = await this.generateTokens(user, deviceId);
    return { user, tokens };
  }

  public async generateTokens(user: IUser, deviceId?: string): Promise<AuthTokens> {
    const payload: TokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const secret: Secret = env.JWT_SECRET as string;
    const refreshSecret: Secret = env.JWT_REFRESH_SECRET as string;

    const accessOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
    const refreshOptions: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any };

    const accessToken = jwt.sign(payload, secret, accessOptions);
    const refreshToken = jwt.sign(payload, refreshSecret, refreshOptions);

    await authRepository.createRefreshToken(user._id, refreshToken, deviceId);

    return { accessToken, refreshToken };
  }

  public async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET as Secret) as TokenPayload;
      const storedToken = await authRepository.findRefreshToken(refreshToken);

      if (!storedToken) {
        throw new AppError('Invalid or revoked refresh token', HttpStatus.UNAUTHORIZED, ErrorCodes.INVALID_TOKEN);
      }

      const user = await userRepository.findById(decoded.userId);
      if (!user || user.isBanned) {
        throw new AppError('User not found or banned', HttpStatus.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED);
      }

      const payload: TokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const secret: Secret = env.JWT_SECRET as string;
      const accessOptions: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as any };
      const accessToken = jwt.sign(payload, secret, accessOptions);

      return { accessToken };
    } catch (err) {
      throw new AppError('Refresh token expired or invalid', HttpStatus.UNAUTHORIZED, ErrorCodes.TOKEN_EXPIRED);
    }
  }

  public async logout(refreshToken: string): Promise<void> {
    await authRepository.deleteRefreshToken(refreshToken);
  }

  public async logoutAllDevices(userId: string): Promise<void> {
    await authRepository.deleteAllRefreshTokens(userId);
  }

  public async revokeSession(userId: string, sessionId: string): Promise<void> {
    const success = await authRepository.revokeSession(sessionId, userId);
    if (!success) {
      throw new AppError('Session not found or already revoked', HttpStatus.NOT_FOUND, ErrorCodes.NOT_FOUND);
    }
  }
}

export const authService = new AuthService();
