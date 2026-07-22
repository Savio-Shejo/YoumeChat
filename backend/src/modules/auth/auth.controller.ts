import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { authService } from './auth.service';
import { Device } from '../devices/device.model';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';
import { AUTH_CONSTANTS } from './auth.constants';

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

export const logoutAllDevices = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  await authService.logoutAllDevices(userId);
  return ResponseHandler.success(res, AUTH_CONSTANTS.LOGOUT_ALL_MESSAGE);
});

export const revokeSession = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { sessionId } = req.params;
  await authService.revokeSession(userId, sessionId);
  return ResponseHandler.success(res, AUTH_CONSTANTS.SESSION_REVOKED_MESSAGE);
});

export const registerDevice = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const device = await Device.findOneAndUpdate(
    { fcmToken: req.body.fcmToken },
    { user: userId, fcmToken: req.body.fcmToken, deviceId: req.body.deviceId, platform: req.body.platform, lastActive: new Date() },
    { upsert: true, new: true }
  ).exec();

  return ResponseHandler.success(res, 'Device registered for push notifications', device);
});
