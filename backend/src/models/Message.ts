import { Schema, model, Document, Types } from 'mongoose';

export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'document' | 'location';
export type DeliveryStatus = 'sent' | 'delivered' | 'read';

export interface IReaction {
  user: Types.ObjectId;
  emoji: string;
}

export interface IMessageEdit {
  content: string;
  editedAt: Date;
}

export interface IMessage extends Document {
  chat: Types.ObjectId;
  sender: Types.ObjectId;
  type: MessageType;
  content?: string;
  mediaUrl?: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  location?: {
    latitude: number;
    longitude: number;
    title?: string;
  };
  replyToMessage?: Types.ObjectId;
  forwardedFrom?: Types.ObjectId;
  deletedFor: Types.ObjectId[];
  isDeletedForEveryone: boolean;
  reactions: IReaction[];
  edits: IMessageEdit[];
  deliveryStatus: DeliveryStatus;
  readBy: Types.ObjectId[];
  deliveredTo: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio', 'document', 'location'],
      default: 'text',
      index: true,
    },
    content: { type: String, trim: true },
    mediaUrl: { type: String },
    thumbnailUrl: { type: String },
    fileName: { type: String },
    fileSize: { type: Number },
    duration: { type: Number },
    location: {
      latitude: Number,
      longitude: Number,
      title: String,
    },
    replyToMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    forwardedFrom: { type: Schema.Types.ObjectId, ref: 'Message' },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    isDeletedForEveryone: { type: Boolean, default: false },
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        emoji: { type: String, required: true },
      },
    ],
    edits: [
      {
        content: { type: String, required: true },
        editedAt: { type: Date, default: Date.now },
      },
    ],
    deliveryStatus: {
      type: String,
      enum: ['sent', 'delivered', 'read'],
      default: 'sent',
      index: true,
    },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    deliveredTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ chat: 1, createdAt: -1 });

export const Message = model<IMessage>('Message', MessageSchema);
