import { cloudinary } from '../../config/cloudinary.config';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/statusCodes';
import { ErrorCodes } from '../../constants/errorCodes';
import { loggers } from '../../common/pinoLogger';

export interface UploadMediaResult {
  mediaUrl: string;
  thumbnailUrl?: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  format: string;
  resourceType: string;
  width?: number;
  height?: number;
  duration?: number;
}

export class MediaService {
  public async uploadMedia(file: Express.Multer.File, folder: string = 'youmechat'): Promise<UploadMediaResult> {
    if (!file) {
      throw new AppError('No file provided for upload', HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
    }

    try {
      if (process.env.CLOUDINARY_CLOUD_NAME) {
        return new Promise<UploadMediaResult>((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: `youmechat/${folder}`,
              resource_type: 'auto',
            },
            (error, result) => {
              if (error || !result) {
                loggers.error.error({ error }, 'Cloudinary upload error');
                return reject(
                  new AppError('Failed to upload file to media server', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.UPLOAD_FAILED)
                );
              }

              let thumbnailUrl: string | undefined = undefined;
              if (result.resource_type === 'image') {
                thumbnailUrl = cloudinary.url(result.public_id, { width: 300, crop: 'scale', secure: true });
              } else if (result.resource_type === 'video') {
                thumbnailUrl = cloudinary.url(`${result.public_id}.jpg`, { resource_type: 'video', width: 300, crop: 'scale', secure: true });
              }

              resolve({
                mediaUrl: result.secure_url,
                thumbnailUrl: thumbnailUrl || result.secure_url,
                publicId: result.public_id,
                fileName: file.originalname || 'file',
                fileSize: file.size || result.bytes,
                format: result.format || file.mimetype.split('/')[1] || 'raw',
                resourceType: result.resource_type,
                width: result.width,
                height: result.height,
                duration: result.duration,
              });
            }
          );
          uploadStream.end(file.buffer);
        });
      } else {
        const base64Data = file.buffer.toString('base64');
        const simulatedUrl = `data:${file.mimetype};base64,${base64Data.substring(0, 100)}...simulated`;
        return {
          mediaUrl: simulatedUrl,
          thumbnailUrl: simulatedUrl,
          publicId: `simulated_${Date.now()}`,
          fileName: file.originalname || 'attachment',
          fileSize: file.size || 1024,
          format: file.mimetype.split('/')[1] || 'raw',
          resourceType: file.mimetype.startsWith('image/') ? 'image' : 'raw',
        };
      }
    } catch (err: any) {
      loggers.error.error({ error: err.message }, 'Media upload exception');
      throw new AppError(err.message || 'File upload failed', HttpStatus.INTERNAL_SERVER_ERROR, ErrorCodes.UPLOAD_FAILED);
    }
  }
}

export const mediaService = new MediaService();
