import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { updateProfileSchema, updateUsernameSchema } from '../validators/user.validator';

const router = Router();

router.use(authenticateJwt);

router.get('/profile', userController.getMyProfile);
router.patch('/profile', validateRequest(updateProfileSchema), userController.updateMyProfile);
router.put('/username', validateRequest(updateUsernameSchema), userController.updateUsername);
router.get('/check-username', userController.checkUsernameAvailability);
router.get('/search', userController.searchUsers);
router.post('/block/:targetUserId', userController.blockUser);
router.delete('/block/:targetUserId', userController.unblockUser);

export default router;
