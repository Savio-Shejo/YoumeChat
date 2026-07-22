import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ResponseHandler } from '../utils/responseHandler';
import { adminService } from '../services/AdminService';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getDashboardAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const analytics = await adminService.getDashboardAnalytics();
  return ResponseHandler.success(res, 'Dashboard analytics retrieved', analytics);
});

export const getAllUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const page = parseInt(req.query.page as string) || 1;
  const result = await adminService.getAllUsers(limit, page);
  return ResponseHandler.success(res, 'All users list fetched', result.users, { total: result.total, page, limit });
});

export const banUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const user = await adminService.banUser(userId);
  return ResponseHandler.success(res, 'User banned successfully', user);
});

export const unbanUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  const user = await adminService.unbanUser(userId);
  return ResponseHandler.success(res, 'User unbanned successfully', user);
});

export const deleteMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { messageId } = req.params;
  const deleted = await adminService.adminDeleteMessage(messageId);
  return ResponseHandler.success(res, 'Message deleted by admin', deleted);
});

export const deleteGroup = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { groupId } = req.params;
  const result = await adminService.adminDeleteGroup(groupId);
  return ResponseHandler.success(res, 'Group deleted by admin', result);
});

export const getReports = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const page = parseInt(req.query.page as string) || 1;
  const status = req.query.status as string;
  const result = await adminService.getReports(limit, page, status);
  return ResponseHandler.success(res, 'Reports list fetched', result.reports, { total: result.total, page, limit });
});

export const resolveReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { reportId } = req.params;
  const { status, notes } = req.body;
  const report = await adminService.resolveReport(reportId, req.user!.id, status, notes);
  return ResponseHandler.success(res, 'Report status updated', report);
});
