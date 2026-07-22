import { z } from 'zod';

export const createGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters'),
  description: z.string().optional(),
  memberIds: z.array(z.string()).default([]),
  avatarUrl: z.string().optional(),
});

export const addMembersSchema = z.object({
  memberIds: z.array(z.string()).min(1, 'At least one member ID is required'),
});

export const removeMemberSchema = z.object({
  memberId: z.string().min(1, 'Member ID to remove is required'),
});
