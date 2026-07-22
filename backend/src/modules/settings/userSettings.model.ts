import { Schema, model, Document, Types } from 'mongoose';

export interface IUserSettings extends Document {
  user: Types.ObjectId;
  darkMode: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  lastSeenPrivacy: 'everyone' | 'contacts' | 'nobody';
  readReceiptsEnabled: boolean;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingsSchema = new Schema<IUserSettings>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    darkMode: { type: Boolean, default: true },
    notificationsEnabled: { type: Boolean, default: true },
    soundEnabled: { type: Boolean, default: true },
    lastSeenPrivacy: { type: String, enum: ['everyone', 'contacts', 'nobody'], default: 'everyone' },
    readReceiptsEnabled: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
  },
  { timestamps: true }
);

export const UserSettings = model<IUserSettings>('UserSettings', UserSettingsSchema);
