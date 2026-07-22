import { Schema, model, Document, Types } from 'mongoose';

export interface ITypingStatus extends Document {
  chat: Types.ObjectId;
  user: Types.ObjectId;
  isTyping: boolean;
  updatedAt: Date;
}

const TypingStatusSchema = new Schema<ITypingStatus>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    isTyping: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TypingStatusSchema.index({ chat: 1, user: 1 }, { unique: true });

export const TypingStatus = model<ITypingStatus>('TypingStatus', TypingStatusSchema);
