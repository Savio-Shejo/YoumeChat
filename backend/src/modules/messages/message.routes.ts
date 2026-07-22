import { Router } from 'express';
import * as messageController from './message.controller';
import { authenticateJwt } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { sendMessageSchema } from '../chats/chat.validator';

const router = Router();

router.use(authenticateJwt);

router.post('/', validateRequest(sendMessageSchema), messageController.sendMessage);
router.get('/chat/:chatId', messageController.getChatMessages);
router.patch('/:messageId', messageController.editMessage);
router.post('/:messageId/reaction', messageController.toggleReaction);
router.delete('/:messageId/me', messageController.deleteForMe);
router.delete('/:messageId/everyone', messageController.deleteForEveryone);

export default router;
