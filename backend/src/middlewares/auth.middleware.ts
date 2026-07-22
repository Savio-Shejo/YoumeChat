import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.config';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../constants/statusCodes';
import { ErrorCodes } from '../constants/errorCodes';
import { TokenPayload } from '../modules/auth/auth.types';
import { userRepository } from '../modules/users/user.repository';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    isBanned: boolean;
  };
}

export const authenticateJwt = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication token missing or invalid', HttpStatus.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as TokenPayload;

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return next(new AppError('User belonging to this token no longer exists', HttpStatus.UNAUTHORIZED, ErrorCodes.USER_NOT_FOUND));
    }

    if (user.isBanned) {
      return next(new AppError('Account is banned', HttpStatus.FORBIDDEN, ErrorCodes.USER_BANNED));
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      isBanned: user.isBanned,
    };

    next();
  } catch (error) {
    return next(new AppError('Invalid or expired authentication token', HttpStatus.UNAUTHORIZED, ErrorCodes.INVALID_TOKEN));
  }
};
