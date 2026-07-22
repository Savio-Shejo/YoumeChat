import { Response } from 'express';
import { HttpStatusCode, HttpStatus } from '../constants/statusCodes';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  code?: string;
  meta?: any;
}

export class ResponseHandler {
  public static success<T>(
    res: Response,
    message: string = 'Operation successful',
    data?: T,
    meta?: any,
    statusCode: HttpStatusCode = HttpStatus.OK
  ): Response {
    const payload: ApiResponse<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
      ...(meta !== undefined && { meta }),
    };
    return res.status(statusCode).json(payload);
  }

  public static created<T>(
    res: Response,
    message: string = 'Resource created successfully',
    data?: T
  ): Response {
    return this.success(res, message, data, undefined, HttpStatus.CREATED);
  }

  public static error(
    res: Response,
    message: string = 'An error occurred',
    statusCode: HttpStatusCode = HttpStatus.BAD_REQUEST,
    code: string = 'ERROR',
    details?: any
  ): Response {
    const payload: ApiResponse = {
      success: false,
      message,
      code,
      ...(details !== undefined && { data: details }),
    };
    return res.status(statusCode).json(payload);
  }
}
