import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/users/user.routes';
import chatRoutes from '../modules/chats/chat.routes';
import messageRoutes from '../modules/messages/message.routes';
import groupRoutes from '../modules/groups/group.routes';
import mediaRoutes from '../modules/media/media.routes';
import reportRoutes from '../modules/reports/report.routes';
import adminRoutes from '../modules/admin/admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/chats', chatRoutes);
router.use('/messages', messageRoutes);
router.use('/groups', groupRoutes);
router.use('/uploads', mediaRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);

export default router;
