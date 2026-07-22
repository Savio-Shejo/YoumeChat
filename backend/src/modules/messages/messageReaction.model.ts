import { Schema, model, Document, Types } from 'mongoose';

export interface IMessageReaction extends Document {
  message: Types.ObjectId;
  user: Types.ObjectId;
  emoji: string;
  createdAt: Date;
}

const MessageReactionSchema = new Schema<IMessageReaction>(
  {
    message: { type: Schema.Types.ObjectId, ref: 'Message', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    emoji: { type: String, required: true },
  },
  { timestamps: true }
);

MessageReactionSchema.index({ message: 1, user: 1 }, { unique: true });

export const MessageReaction = model<IMessageReaction>('MessageReaction', MessageReactionSchema);
