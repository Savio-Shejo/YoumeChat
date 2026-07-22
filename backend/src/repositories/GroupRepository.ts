import { Group, IGroup } from '../models/Group';
import { Types } from 'mongoose';

export class GroupRepository {
  public async findById(id: string | Types.ObjectId): Promise<IGroup | null> {
    return Group.findById(id)
      .populate('admins', 'username displayName avatarUrl isOnline')
      .populate('creator', 'username displayName avatarUrl')
      .exec();
  }

  public async findByChatId(chatId: string | Types.ObjectId): Promise<IGroup | null> {
    return Group.findOne({ chat: new Types.ObjectId(chatId) })
      .populate('admins', 'username displayName avatarUrl isOnline')
      .populate('creator', 'username displayName avatarUrl')
      .exec();
  }

  public async createGroup(groupData: Partial<IGroup>): Promise<IGroup> {
    const group = new Group(groupData);
    return group.save();
  }

  public async updateGroup(groupId: string, updateData: Partial<IGroup>): Promise<IGroup | null> {
    return Group.findByIdAndUpdate(groupId, updateData, { new: true, runValidators: true }).exec();
  }

  public async addAdmin(groupId: string, userId: string): Promise<IGroup | null> {
    return Group.findByIdAndUpdate(
      groupId,
      { $addToSet: { admins: new Types.ObjectId(userId) } },
      { new: true }
    ).exec();
  }

  public async removeAdmin(groupId: string, userId: string): Promise<IGroup | null> {
    return Group.findByIdAndUpdate(
      groupId,
      { $pull: { admins: new Types.ObjectId(userId) } },
      { new: true }
    ).exec();
  }

  public async deleteGroup(groupId: string): Promise<boolean> {
    const res = await Group.findByIdAndDelete(groupId).exec();
    return !!res;
  }
}

export const groupRepository = new GroupRepository();
