import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ResponseHandler } from '../utils/responseHandler';
import { reportRepository } from '../repositories/ReportRepository';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const createReport = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const report = await reportRepository.createReport({
    reporter: req.user!.id as any,
    targetType: req.body.targetType,
    targetId: req.body.targetId,
    reason: req.body.reason,
    description: req.body.description,
  });
  return ResponseHandler.created(res, 'Report submitted successfully', report);
});
