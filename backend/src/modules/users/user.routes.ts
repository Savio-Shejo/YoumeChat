import { Router } from 'express';
import * as userController from './user.controller';
import { authenticateJwt } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { updateProfileSchema, updateUsernameSchema } from './user.validator';

const router = Router();

router.use(authenticateJwt);

router.get('/profile', userController.getMyProfile);
router.patch('/profile', validateRequest(updateProfileSchema), userController.updateMyProfile);
router.put('/profile', validateRequest(updateProfileSchema), userController.updateMyProfile);
router.put('/username', validateRequest(updateUsernameSchema), userController.updateUsername);
router.get('/check-username', userController.checkUsernameAvailability);
router.get('/search', userController.searchUsers);
router.get('/:id', userController.getUserById);
router.post('/block/:targetUserId', userController.blockUser);
router.delete('/block/:targetUserId', userController.unblockUser);

export default router;
