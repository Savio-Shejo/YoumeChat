import { Schema, model, Document, Types } from 'mongoose';
import { Roles, UserRole } from '../constants/roles';

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  statusMessage?: string;
  isOnline: boolean;
  lastSeen: Date;
  role: UserRole;
  isBanned: boolean;
  blockedUsers: Types.ObjectId[];
  settings: {
    darkMode: boolean;
    notificationsEnabled: boolean;
    lastSeenVisible: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    firebaseUid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    displayName: { type: String, required: true, trim: true },
    avatarUrl: { type: String, default: '' },
    statusMessage: { type: String, default: 'Hey there! I am using YoumeChat.' },
    isOnline: { type: Boolean, default: false, index: true },
    lastSeen: { type: Date, default: Date.now },
    role: { type: String, enum: Object.values(Roles), default: Roles.USER, index: true },
    isBanned: { type: Boolean, default: false, index: true },
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    settings: {
      darkMode: { type: Boolean, default: true },
      notificationsEnabled: { type: Boolean, default: true },
      lastSeenVisible: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.index({ displayName: 'text', username: 'text', email: 'text' });

export const User = model<IUser>('User', UserSchema);
