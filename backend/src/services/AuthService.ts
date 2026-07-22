import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.config';
import { admin } from '../config/firebase.config';
import { userRepository } from '../repositories/UserRepository';
import { RefreshToken } from '../models/RefreshToken';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../constants/statusCodes';
import { ErrorCodes } from '../constants/errorCodes';
import { IUser } from '../models/User';
import { logger } from '../utils/logger';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export class AuthService {
  public async verifyGoogleTokenAndLogin(idToken: string, deviceId?: string) {
    let firebaseUser: { uid: string; email: string; name?: string; picture?: string };

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
        logger.error('Firebase token verification error:', err);
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
        lastSeen: new Date(),
      });
    }

    if (user.isBanned) {
      throw new AppError('Your account has been banned. Please contact support.', HttpStatus.FORBIDDEN, ErrorCodes.USER_BANNED);
    }

    const tokens = await this.generateTokens(user, deviceId);
    return { user, tokens };
  }

  public async generateTokens(user: IUser, deviceId?: string) {
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

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      deviceId,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }

  public async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET as Secret) as TokenPayload;
      const storedToken = await RefreshToken.findOne({ token: refreshToken }).exec();

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

  public async logout(refreshToken: string) {
    await RefreshToken.deleteOne({ token: refreshToken }).exec();
  }
}

export const authService = new AuthService();
