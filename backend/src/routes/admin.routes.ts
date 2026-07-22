import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { resolveReportSchema } from '../validators/report.validator';

const router = Router();

router.use(authenticateJwt, requireAdmin);

router.get('/analytics', adminController.getDashboardAnalytics);
router.get('/users', adminController.getAllUsers);
router.post('/users/:userId/ban', adminController.banUser);
router.post('/users/:userId/unban', adminController.unbanUser);
router.delete('/messages/:messageId', adminController.deleteMessage);
router.delete('/groups/:groupId', adminController.deleteGroup);
router.get('/reports', adminController.getReports);
router.patch('/reports/:reportId', validateRequest(resolveReportSchema), adminController.resolveReport);

export default router;
