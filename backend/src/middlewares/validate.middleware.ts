import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../constants/statusCodes';
import { ErrorCodes } from '../constants/errorCodes';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        return next(new AppError(`Validation Failed: ${issues}`, HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR, true, error.errors));
      }
      next(error);
    }
  };
};
