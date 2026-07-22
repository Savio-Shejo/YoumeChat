import { z } from 'zod';

export const createPrivateChatSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
});

export const sendMessageSchema = z.object({
  chatId: z.string().min(1, 'Chat ID is required'),
  type: z.enum(['text', 'image', 'video', 'audio', 'document', 'location']).default('text'),
  content: z.string().optional(),
  mediaUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  duration: z.number().optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
      title: z.string().optional(),
    })
    .optional(),
  replyToMessageId: z.string().optional(),
  forwardedFromId: z.string().optional(),
});
