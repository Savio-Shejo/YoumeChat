import { userRepository } from './user.repository';
import { AppError } from '../../utils/appError';
import { HttpStatus } from '../../constants/statusCodes';
import { ErrorCodes } from '../../constants/errorCodes';
import { BlockedUser } from '../blockedUsers/blockedUser.model';

export class UserService {
  public async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCodes.USER_NOT_FOUND);
    }
    return user;
  }

  public async updateProfile(
    userId: string,
    data: { displayName?: string; avatarUrl?: string; statusMessage?: string; settings?: any }
  ) {
    const updated = await userRepository.update(userId, data);
    if (!updated) {
      throw new AppError('User not found', HttpStatus.NOT_FOUND, ErrorCodes.USER_NOT_FOUND);
    }
    return updated;
  }

  public async updateUsername(userId: string, newUsername: string) {
    const cleanUsername = newUsername.toLowerCase().trim();
    const existing = await userRepository.findByUsername(cleanUsername);

    if (existing && existing._id.toString() !== userId) {
      throw new AppError('Username is already taken', HttpStatus.CONFLICT, ErrorCodes.USERNAME_TAKEN);
    }

    return userRepository.update(userId, { username: cleanUsername });
  }

  public async checkUsernameAvailability(username: string) {
    const existing = await userRepository.findByUsername(username.toLowerCase().trim());
    return { available: !existing };
  }

  public async searchUsers(query: string, currentUserId: string, limit: number, page: number) {
    return userRepository.searchUsers(query, currentUserId, limit, page);
  }

  public async blockUser(userId: string, targetUserId: string) {
    if (userId === targetUserId) {
      throw new AppError('You cannot block yourself', HttpStatus.BAD_REQUEST, ErrorCodes.VALIDATION_ERROR);
    }
    const target = await userRepository.findById(targetUserId);
    if (!target) {
      throw new AppError('Target user not found', HttpStatus.NOT_FOUND, ErrorCodes.USER_NOT_FOUND);
    }
    return BlockedUser.findOneAndUpdate(
      { user: userId, blockedUser: targetUserId },
      { user: userId, blockedUser: targetUserId },
      { upsert: true, new: true }
    ).exec();
  }

  public async unblockUser(userId: string, targetUserId: string) {
    await BlockedUser.deleteOne({ user: userId, blockedUser: targetUserId }).exec();
    return true;
  }
}

export const userService = new UserService();
