import { Schema, model, Document, Types } from 'mongoose';

export type CallType = 'audio' | 'video';
export type CallStatus = 'ringing' | 'connected' | 'rejected' | 'ended' | 'missed';

export interface ICall extends Document {
  caller: Types.ObjectId;
  receiver: Types.ObjectId;
  type: CallType;
  status: CallStatus;
  startedAt?: Date;
  endedAt?: Date;
  duration?: number;
  createdAt: Date;
}

const CallSchema = new Schema<ICall>(
  {
    caller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['audio', 'video'], required: true },
    status: { type: String, enum: ['ringing', 'connected', 'rejected', 'ended', 'missed'], default: 'ringing', index: true },
    startedAt: Date,
    endedAt: Date,
    duration: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Call = model<ICall>('Call', CallSchema);
