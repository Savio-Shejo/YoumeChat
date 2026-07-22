import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createPrivateChatSchema } from '../validators/chat.validator';

const router = Router();

router.use(authenticateJwt);

router.post('/private', validateRequest(createPrivateChatSchema), chatController.createPrivateChat);
router.get('/', chatController.getMyChats);
router.get('/:chatId', chatController.getChatById);
router.put('/:chatId/pin', chatController.togglePinChat);
router.put('/:chatId/mute', chatController.toggleMuteChat);
router.put('/:chatId/archive', chatController.toggleArchiveChat);

export default router;
