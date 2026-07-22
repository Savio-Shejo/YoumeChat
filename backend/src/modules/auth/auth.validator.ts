import { z } from 'zod';

export const googleLoginSchema = z.object({
  idToken: z.string().min(1, 'Google idToken is required'),
  deviceId: z.string().optional(),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const registerDeviceSchema = z.object({
  fcmToken: z.string().min(1, 'FCM token is required'),
  deviceId: z.string().min(1, 'Device ID is required'),
  platform: z.enum(['android', 'ios', 'web', 'desktop']).default('android'),
});
