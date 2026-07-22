import { Router } from 'express';
import * as uploadController from '../controllers/upload.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';
import { uploadRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

router.use(authenticateJwt);

router.post('/media', uploadRateLimiter, upload.single('file'), uploadController.uploadMedia);

export default router;
