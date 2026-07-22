import { Schema, model, Document, Types } from 'mongoose';

export interface IPresence extends Document {
  user: Types.ObjectId;
  isOnline: boolean;
  lastSeen: Date;
  activeSocketsCount: number;
  updatedAt: Date;
}

const PresenceSchema = new Schema<IPresence>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    isOnline: { type: Boolean, default: false, index: true },
    lastSeen: { type: Date, default: Date.now },
    activeSocketsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Presence = model<IPresence>('Presence', PresenceSchema);
