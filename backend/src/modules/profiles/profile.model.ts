import { Schema, model, Document, Types } from 'mongoose';

export interface IProfile extends Document {
  user: Types.ObjectId;
  bio: string;
  website?: string;
  location?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  customStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    bio: { type: String, default: 'Hey there! I am using YoumeChat.', max: 250 },
    website: { type: String, default: '' },
    location: { type: String, default: '' },
    socialLinks: {
      twitter: String,
      github: String,
      linkedin: String,
    },
    customStatus: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Profile = model<IProfile>('Profile', ProfileSchema);
