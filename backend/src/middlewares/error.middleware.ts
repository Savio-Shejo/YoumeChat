import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/appError';
import { HttpStatusCode, HttpStatus } from '../constants/statusCodes';
import { ErrorCode, ErrorCodes } from '../constants/errorCodes';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let code: string = ErrorCodes.INTERNAL_ERROR;
  let message = 'An unexpected server error occurred';
  let details: any = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
    details = err.details;
  } else {
    logger.error('Unhandled System Exception:', err);
    message = process.env.NODE_ENV === 'production' ? message : err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(details !== undefined && { details }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
