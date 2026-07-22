import { Schema, model, Document, Types } from 'mongoose';

export interface IPinnedChat extends Document {
  user: Types.ObjectId;
  chat: Types.ObjectId;
  pinnedAt: Date;
}

const PinnedChatSchema = new Schema<IPinnedChat>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    pinnedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

PinnedChatSchema.index({ user: 1, chat: 1 }, { unique: true });

export const PinnedChat = model<IPinnedChat>('PinnedChat', PinnedChatSchema);
