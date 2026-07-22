import { userRepository } from '../repositories/UserRepository';
import { chatRepository } from '../repositories/ChatRepository';
import { messageRepository } from '../repositories/MessageRepository';
import { groupRepository } from '../repositories/GroupRepository';
import { reportRepository } from '../repositories/ReportRepository';
import { User } from '../models/User';
import { Chat } from '../models/Chat';
import { Message } from '../models/Message';
import { Group } from '../models/Group';
import { Report } from '../models/Report';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../constants/statusCodes';
import { ErrorCodes } from '../constants/errorCodes';

export class AdminService {
  public async getDashboardAnalytics() {
    const [totalUsers, activeUsers, totalChats, totalMessages, totalGroups, pendingReports] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isOnline: true }),
      Chat.countDocuments(),
      Message.countDocuments(),
      Group.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalChats,
      totalMessages,
      totalGroups,
      pendingReports,
    };
  }

  public async getAllUsers(limit: number, page: number) {
    return userRepository.getAllUsers(limit, page);
  }

  public async banUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCodes.USER_NOT_FOUND);
    return userRepository.setBanStatus(userId, true);
  }

  public async unbanUser(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCodes.USER_NOT_FOUND);
    return userRepository.setBanStatus(userId, false);
  }

  public async adminDeleteMessage(messageId: string) {
    const message = await messageRepository.findById(messageId);
    if (!message) throw new AppError('Message not found', HttpStatus.NOT_FOUND, ErrorCodes.MESSAGE_NOT_FOUND);
    return messageRepository.deleteForEveryone(messageId);
  }

  public async adminDeleteGroup(groupId: string) {
    const group = await groupRepository.findById(groupId);
    if (!group) throw new AppError('Group not found', HttpStatus.NOT_FOUND, ErrorCodes.GROUP_NOT_FOUND);

    await groupRepository.deleteGroup(groupId);
    await chatRepository.deleteChat(group.chat.toString());
    await messageRepository.deleteChatMessages(group.chat.toString());
    return { deleted: true };
  }

  public async getReports(limit: number, page: number, status?: string) {
    return reportRepository.getReports(limit, page, status);
  }

  public async resolveReport(reportId: string, adminUserId: string, status: string, notes?: string) {
    return reportRepository.updateReportStatus(reportId, status, adminUserId, notes);
  }
}

export const adminService = new AdminService();
