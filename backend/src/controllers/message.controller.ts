import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ResponseHandler } from '../utils/responseHandler';
import { messageService } from '../services/MessageService';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const sendMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const message = await messageService.sendMessage({
    ...req.body,
    senderId: req.user!.id,
  });
  return ResponseHandler.created(res, 'Message sent successfully', message);
});

export const getChatMessages = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { chatId } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  const beforeDate = req.query.before as string;
  const messages = await messageService.getChatMessages(chatId, req.user!.id, limit, beforeDate);
  return ResponseHandler.success(res, 'Messages retrieved', messages);
});

export const editMessage = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { messageId } = req.params;
  const { content } = req.body;
  const updated = await messageService.editMessage(messageId, req.user!.id, content);
  return ResponseHandler.success(res, 'Message edited successfully', updated);
});

export const toggleReaction = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  const updated = await messageService.toggleReaction(messageId, req.user!.id, emoji);
  return ResponseHandler.success(res, 'Reaction updated', updated);
});

export const deleteForMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { messageId } = req.params;
  await messageService.deleteForMe(messageId, req.user!.id);
  return ResponseHandler.success(res, 'Message deleted for you');
});

export const deleteForEveryone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { messageId } = req.params;
  const deleted = await messageService.deleteForEveryone(messageId, req.user!.id);
  return ResponseHandler.success(res, 'Message deleted for everyone', deleted);
});
