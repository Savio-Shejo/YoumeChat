import { groupRepository } from '../repositories/GroupRepository';
import { chatRepository } from '../repositories/ChatRepository';
import { userRepository } from '../repositories/UserRepository';
import { AppError } from '../utils/appError';
import { HttpStatus } from '../constants/statusCodes';
import { ErrorCodes } from '../constants/errorCodes';
import { Types } from 'mongoose';

export class GroupService {
  public async createGroup(creatorId: string, name: string, description?: string, memberIds: string[] = [], avatarUrl?: string) {
    const allParticipants = Array.from(new Set([creatorId, ...memberIds]));

    const chat = await chatRepository.createChat({
      type: 'group',
      participants: allParticipants.map((id) => new Types.ObjectId(id)),
    });

    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const group = await groupRepository.createGroup({
      chat: chat._id as any,
      name,
      description,
      avatarUrl,
      creator: new Types.ObjectId(creatorId),
      admins: [new Types.ObjectId(creatorId)],
      inviteCode,
    });

    return { chat, group };
  }

  public async getGroupDetails(groupId: string, userId: string) {
    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', HttpStatus.NOT_FOUND, ErrorCodes.GROUP_NOT_FOUND);
    }
    return group;
  }

  public async addMembers(groupId: string, userId: string, memberIds: string[]) {
    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', HttpStatus.NOT_FOUND, ErrorCodes.GROUP_NOT_FOUND);
    }

    const isAdmin = group.admins.some((a: any) => a._id.toString() === userId || a.toString() === userId);
    if (!isAdmin && !group.memberPermissions.addMembers) {
      throw new AppError('Only group admins can add members', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
    }

    const chat = await chatRepository.findById(group.chat.toString());
    if (chat) {
      const existingIds = chat.participants.map((p: any) => p._id?.toString() || p.toString());
      const newParticipants = Array.from(new Set([...existingIds, ...memberIds]));
      chat.participants = newParticipants.map((id) => new Types.ObjectId(id)) as any;
      await chat.save();
    }

    return group;
  }

  public async removeMember(groupId: string, userId: string, memberIdToRemove: string) {
    const group = await groupRepository.findById(groupId);
    if (!group) {
      throw new AppError('Group not found', HttpStatus.NOT_FOUND, ErrorCodes.GROUP_NOT_FOUND);
    }

    const isAdmin = group.admins.some((a: any) => a._id.toString() === userId || a.toString() === userId);
    const isSelfRemove = userId === memberIdToRemove;

    if (!isAdmin && !isSelfRemove) {
      throw new AppError('Only admins can remove members', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);
    }

    const chat = await chatRepository.findById(group.chat.toString());
    if (chat) {
      chat.participants = chat.participants.filter(
        (p: any) => p._id?.toString() !== memberIdToRemove && p.toString() !== memberIdToRemove
      ) as any;
      await chat.save();
    }

    await groupRepository.removeAdmin(groupId, memberIdToRemove);
    return group;
  }

  public async promoteAdmin(groupId: string, userId: string, targetUserId: string) {
    const group = await groupRepository.findById(groupId);
    if (!group) throw new AppError('Group not found', HttpStatus.NOT_FOUND, ErrorCodes.GROUP_NOT_FOUND);

    const isAdmin = group.admins.some((a: any) => a._id.toString() === userId || a.toString() === userId);
    if (!isAdmin) throw new AppError('Only group admins can promote members', HttpStatus.FORBIDDEN, ErrorCodes.FORBIDDEN);

    return groupRepository.addAdmin(groupId, targetUserId);
  }
}

export const groupService = new GroupService();
