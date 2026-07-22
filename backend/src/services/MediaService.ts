import { cloudinary } from '../config/cloudinary.config';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../constants/statusCodes';
import { ErrorCodes } from '../constants/errorCodes';
import { logger } from '../utils/logger';

export class MediaService {
  public async uploadMedia(file: Express.Multer.File, folder: string = 'youmechat') {
    if (!file) {
      throw new AppError('No file provided for upload', HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
    }

    try {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        return new Promise<{ mediaUrl: string; thumbnailUrl?: string; publicId: string }>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `youmechat/${folder}`,
              resource_type: 'auto',
            },
            (error, result) => {
              if (error || !result) {
                logger.error('Cloudinary upload error:', error);
                return reject(
                  new AppError('Failed to upload file to media server', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.UPLOAD_FAILED)
                );
              }
              resolve({
                mediaUrl: result.secure_url,
                thumbnailUrl: result.resource_type === 'image' ? result.secure_url : undefined,
                publicId: result.public_id,
              });
            }
          );
          uploadStream.end(file.buffer);
        });
      } else {
        // Fallback simulation mode for local dev without credentials
        const base64Data = file.buffer.toString('base64');
        const simulatedUrl = `data:${file.mimetype};base64,${base64Data.substring(0, 100)}...simulated`;
        return {
          mediaUrl: simulatedUrl,
          thumbnailUrl: simulatedUrl,
          publicId: `simulated_${Date.now()}`,
        };
      }
    } catch (err: any) {
      logger.error('Media upload exception:', err);
      throw new AppError(err.message || 'File upload failed', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.UPLOAD_FAILED);
    }
  }
}

export const mediaService = new MediaService();
