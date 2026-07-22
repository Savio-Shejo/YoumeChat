import { Schema, model, Document, Types } from 'mongoose';

export interface IBlockedUser extends Document {
  user: Types.ObjectId;
  blockedUser: Types.ObjectId;
  reason?: string;
  createdAt: Date;
}

const BlockedUserSchema = new Schema<IBlockedUser>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    blockedUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    reason: { type: String, default: '' },
  },
  { timestamps: true }
);

BlockedUserSchema.index({ user: 1, blockedUser: 1 }, { unique: true });

export const BlockedUser = model<IBlockedUser>('BlockedUser', BlockedUserSchema);
