import { z } from 'zod';

export const createReportSchema = z.object({
  targetType: z.enum(['user', 'group', 'message']),
  targetId: z.string().min(1, 'Target ID is required'),
  reason: z.string().min(2, 'Reason is required'),
  description: z.string().optional(),
});

export const resolveReportSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved', 'dismissed']),
  notes: z.string().optional(),
});
