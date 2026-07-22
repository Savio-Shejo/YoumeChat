import { Router } from 'express';
import * as mediaController from './media.controller';
import { authenticateJwt } from '../../middlewares/auth.middleware';
import { upload } from '../../middlewares/upload.middleware';
import { uploadRateLimiter } from '../../middlewares/rateLimiter.middleware';

const router = Router();

router.use(authenticateJwt);

router.post('/media', uploadRateLimiter, upload.single('file'), mediaController.uploadMedia);

export default router;
