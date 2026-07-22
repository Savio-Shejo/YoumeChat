import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../constants/statusCodes';
import { ErrorCodes } from '../constants/errorCodes';
import { Roles, UserRole } from '../constants/roles';

export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('User authentication required', HttpStatus.UNAUTHORIZED, ErrorCodes.UNAUTHORIZED));
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return next(
        new AppError('Permission denied. Insufficient administrative privileges.', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN)
      );
    }

    next();
  };
};

export const requireAdmin = authorizeRoles(Roles.ADMIN);
