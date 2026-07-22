import { Schema, model, Document, models } from 'mongoose';
import { Roles, UserRole } from '../../constants/roles';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  isOnline?: boolean;
  lastSeen?: Date;
  role: UserRole;
  isBanned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    displayName: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: '' },
    isOnline: { type: Boolean, default: false, index: true },
    lastSeen: { type: Date, default: Date.now },
    role: { type: String, enum: Object.values(Roles), default: Roles.USER, index: true },
    isBanned: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

UserSchema.index({ displayName: 'text', username: 'text', email: 'text' });

export const User = models.User || model<IUser>('User', UserSchema);
