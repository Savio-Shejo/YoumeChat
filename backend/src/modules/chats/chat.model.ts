import { Schema, model, Document, Types, models } from 'mongoose';

export interface IChat extends Document {
  type: 'private' | 'group';
  participants: Types.ObjectId[];
  lastMessage?: Types.ObjectId;
  isArchivedBy: Types.ObjectId[];
  isMutedBy: Types.ObjectId[];
  pinnedBy: Types.ObjectId[];
  unreadCounts: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    type: { type: String, enum: ['private', 'group'], required: true, index: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true, index: true }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    isArchivedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isMutedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    pinnedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    unreadCounts: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  },
  { timestamps: true }
);

ChatSchema.index({ participants: 1, type: 1 });
ChatSchema.index({ updatedAt: -1 });

export const Chat = models.Chat || model<IChat>('Chat', ChatSchema);
