import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createReportSchema } from '../validators/report.validator';

const router = Router();

router.use(authenticateJwt);

router.post('/', validateRequest(createReportSchema), reportController.createReport);

export default router;
