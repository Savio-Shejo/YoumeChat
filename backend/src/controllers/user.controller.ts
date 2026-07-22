import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ResponseHandler } from '../utils/responseHandler';
import { userService } from '../services/UserService';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getMyProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const user = await userService.getProfile(req.user!.id);
  return ResponseHandler.success(res, 'User profile fetched successfully', user);
});

export const updateMyProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedUser = await userService.updateProfile(req.user!.id, req.body);
  return ResponseHandler.success(res, 'Profile updated successfully', updatedUser);
});

export const updateUsername = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updatedUser = await userService.updateUsername(req.user!.id, req.body.username);
  return ResponseHandler.success(res, 'Username updated successfully', updatedUser);
});

export const checkUsernameAvailability = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const username = req.query.username as string;
  const result = await userService.checkUsernameAvailability(username || '');
  return ResponseHandler.success(res, 'Username availability checked', result);
});

export const searchUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const query = (req.query.q as string) || '';
  const limit = parseInt(req.query.limit as string) || 20;
  const page = parseInt(req.query.page as string) || 1;
  const result = await userService.searchUsers(query, req.user!.id, limit, page);
  return ResponseHandler.success(res, 'Users search completed', result.users, { total: result.total, page, limit });
});

export const blockUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const targetUserId = req.params.targetUserId;
  await userService.blockUser(req.user!.id, targetUserId);
  return ResponseHandler.success(res, 'User blocked successfully');
});

export const unblockUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const targetUserId = req.params.targetUserId;
  await userService.unblockUser(req.user!.id, targetUserId);
  return ResponseHandler.success(res, 'User unblocked successfully');
});
