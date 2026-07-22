import { ErrorCode, ErrorCodes } from '../constants/errorCodes';
import { HttpStatusCode, HttpStatus } from '../constants/statusCodes';

export class AppError extends Error {
  public readonly statusCode: HttpStatusCode;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: HttpStatusCode = HttpStatus.BAD_REQUEST,
    code: ErrorCode = ErrorCodes.VALIDATION_ERROR,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
