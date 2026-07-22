import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ResponseHandler } from '../utils/responseHandler';
import { authService } from '../services/AuthService';
import { deviceRepository } from '../repositories/DeviceRepository';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const googleLogin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { idToken, deviceId } = req.body;
  const result = await authService.verifyGoogleTokenAndLogin(idToken, deviceId);
  return ResponseHandler.success(res, 'Login successful', result);
});

export const refreshToken = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken } = req.body;
  const result = await authService.refreshAccessToken(refreshToken);
  return ResponseHandler.success(res, 'Token refreshed successfully', result);
});

export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await authService.logout(refreshToken);
  }
  return ResponseHandler.success(res, 'Logged out successfully');
});

export const registerDevice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const device = await deviceRepository.registerDevice({
    user: userId as any,
    fcmToken: req.body.fcmToken,
    deviceId: req.body.deviceId,
    platform: req.body.platform,
  });
  return ResponseHandler.success(res, 'Device registered for push notifications', device);
});
