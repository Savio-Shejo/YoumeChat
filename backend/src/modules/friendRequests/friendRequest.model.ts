import { Schema, model, Document, Types } from 'mongoose';

export interface IFriendRequest extends Document {
  sender: Types.ObjectId;
  recipient: Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const FriendRequestSchema = new Schema<IFriendRequest>(
  {
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending', index: true },
  },
  { timestamps: true }
);

FriendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

export const FriendRequest = model<IFriendRequest>('FriendRequest', FriendRequestSchema);
