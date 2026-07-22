import { z } from 'zod';

export const updateProfileSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters').optional(),
  avatarUrl: z.string().url().or(z.literal('')).optional(),
  statusMessage: z.string().max(200, 'Status message max 200 chars').optional(),
  settings: z
    .object({
      darkMode: z.boolean().optional(),
      notificationsEnabled: z.boolean().optional(),
      lastSeenVisible: z.boolean().optional(),
    })
    .optional(),
});

export const updateUsernameSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username max 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores'),
});
