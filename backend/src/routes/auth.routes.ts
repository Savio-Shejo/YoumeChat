import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validate.middleware';
import { googleLoginSchema, refreshTokenSchema, registerDeviceSchema } from '../validators/auth.validator';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';
import { authenticateJwt } from '../middlewares/auth.middleware';

const router = Router();

router.post('/google-login', authRateLimiter, validateRequest(googleLoginSchema), authController.googleLogin);
router.post('/refresh-token', validateRequest(refreshTokenSchema), authController.refreshToken);
router.post('/logout', validateRequest(refreshTokenSchema), authController.logout);
router.post('/register-device', authenticateJwt, validateRequest(registerDeviceSchema), authController.registerDevice);

export default router;
