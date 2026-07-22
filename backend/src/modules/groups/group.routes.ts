import { Router } from 'express';
import * as groupController from './group.controller';
import { authenticateJwt } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { createGroupSchema, addMembersSchema } from './group.validator';

const router = Router();

router.use(authenticateJwt);

router.post('/', validateRequest(createGroupSchema), groupController.createGroup);
router.get('/:groupId', groupController.getGroupDetails);
router.post('/:groupId/members', validateRequest(addMembersSchema), groupController.addMembers);
router.delete('/:groupId/members/:memberId', groupController.removeMember);
router.put('/:groupId/members/:memberId/promote', groupController.promoteAdmin);

export default router;
