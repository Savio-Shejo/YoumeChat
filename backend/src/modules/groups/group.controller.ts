import { Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ResponseHandler } from '../../utils/responseHandler';
import { groupService } from './group.service';
import { AuthenticatedRequest } from '../../middlewares/auth.middleware';

export const createGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { name, description, memberIds, avatarUrl } = req.body;
  const result = await groupService.createGroup(req.user!.id, name, description, memberIds, avatarUrl);
  return ResponseHandler.created(res, 'Group created successfully', result);
});

export const getGroupDetails = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { groupId } = req.params;
  const group = await groupService.getGroupDetails(groupId, req.user!.id);
  return ResponseHandler.success(res, 'Group details retrieved', group);
});

export const addMembers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { groupId } = req.params;
  const { memberIds } = req.body;
  const group = await groupService.addMembers(groupId, req.user!.id, memberIds);
  return ResponseHandler.success(res, 'Members added successfully', group);
});

export const removeMember = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { groupId, memberId } = req.params;
  const group = await groupService.removeMember(groupId, req.user!.id, memberId);
  return ResponseHandler.success(res, 'Member removed successfully', group);
});

export const promoteAdmin = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { groupId, memberId } = req.params;
  const group = await groupService.promoteAdmin(groupId, req.user!.id, memberId);
  return ResponseHandler.success(res, 'Member promoted to admin', group);
});
