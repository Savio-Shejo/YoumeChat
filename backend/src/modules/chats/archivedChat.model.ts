import { Schema, model, Document, Types } from 'mongoose';

export interface IArchivedChat extends Document {
  user: Types.ObjectId;
  chat: Types.ObjectId;
  archivedAt: Date;
}

const ArchivedChatSchema = new Schema<IArchivedChat>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    archivedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ArchivedChatSchema.index({ user: 1, chat: 1 }, { unique: true });

export const ArchivedChat = model<IArchivedChat>('ArchivedChat', ArchivedChatSchema);
