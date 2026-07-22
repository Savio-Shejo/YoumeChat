import { User, IUser } from './user.model';
import { Types } from 'mongoose';

export class UserRepository {
  public async findById(id: string | Types.ObjectId): Promise<IUser | null> {
    return User.findById(id).exec();
  }

  public async findByFirebaseUid(firebaseUid: string): Promise<IUser | null> {
    return User.findOne({ firebaseUid }).exec();
  }

  public async findByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).exec();
  }

  public async findByUsername(username: string): Promise<IUser | null> {
    return User.findOne({ username: username.toLowerCase() }).exec();
  }

  public async create(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return user.save();
  }

  public async update(id: string | Types.ObjectId, updateData: Partial<IUser>): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).exec();
  }

  public async updateOnlineStatus(id: string | Types.ObjectId, isOnline: boolean): Promise<IUser | null> {
    return User.findByIdAndUpdate(id, { isOnline }, { new: true }).exec();
  }

  public async searchUsers(
    query: string,
    currentUserId: string,
    limit: number = 20,
    page: number = 1
  ): Promise<{ users: IUser[]; total: number }> {
    const searchRegex = new RegExp(query, 'i');
    const filter = {
      _id: { $ne: new Types.ObjectId(currentUserId) },
      isBanned: false,
      $or: [{ username: searchRegex }, { displayName: searchRegex }, { email: searchRegex }],
    };

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).exec(),
      User.countDocuments(filter),
    ]);

    return { users, total };
  }

  public async getAllUsers(limit: number = 20, page: number = 1): Promise<{ users: IUser[]; total: number }> {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
      User.countDocuments(),
    ]);

    return { users, total };
  }

  public async setBanStatus(userId: string, isBanned: boolean): Promise<IUser | null> {
    return User.findByIdAndUpdate(userId, { isBanned }, { new: true }).exec();
  }
}

export const userRepository = new UserRepository();
