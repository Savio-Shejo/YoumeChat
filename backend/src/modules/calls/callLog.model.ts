import { Schema, model, Document, Types } from 'mongoose';

export interface ICallLog extends Document {
  user: Types.ObjectId;
  call: Types.ObjectId;
  direction: 'incoming' | 'outgoing' | 'missed';
  createdAt: Date;
}

const CallLogSchema = new Schema<ICallLog>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    call: { type: Schema.Types.ObjectId, ref: 'Call', required: true, index: true },
    direction: { type: String, enum: ['incoming', 'outgoing', 'missed'], required: true },
  },
  { timestamps: true }
);

export const CallLog = model<ICallLog>('CallLog', CallLogSchema);
