import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ResponseHandler } from '../utils/responseHandler';
import { chatService } from '../services/ChatService';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const createPrivateChat = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { targetUserId } = req.body;
  const chat = await chatService.getOrCreatePrivateChat(req.user!.id, targetUserId);
  return ResponseHandler.created(res, 'Chat opened', chat);
});

export const getMyChats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const page = parseInt(req.query.page as string) || 1;
  const result = await chatService.getUserChats(req.user!.id, limit, page);
  return ResponseHandler.success(res, 'User chats fetched', result.chats, { total: result.total, page, limit });
});

export const getChatById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const chat = await chatService.getChatById(req.params.chatId, req.user!.id);
  return ResponseHandler.success(res, 'Chat fetched successfully', chat);
});

export const togglePinChat = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const chat = await chatService.togglePinChat(req.params.chatId, req.user!.id);
  return ResponseHandler.success(res, 'Chat pin status toggled', chat);
});

export const toggleMuteChat = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const chat = await chatService.toggleMuteChat(req.params.chatId, req.user!.id);
  return ResponseHandler.success(res, 'Chat mute status toggled', chat);
});

export const toggleArchiveChat = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const chat = await chatService.toggleArchiveChat(req.params.chatId, req.user!.id);
  return ResponseHandler.success(res, 'Chat archive status toggled', chat);
});
