import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { mediaService } from './media.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export const uploadMedia = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const file = req.file as Express.Multer.File;
  const folder = (req.query.folder as string) || 'chat_media';
  const result = await mediaService.uploadMedia(file, folder);
  return ResponseHandler.success(res, 'File uploaded successfully', result);
});
