import { Schema, model, Document, Types } from 'mongoose';

export interface IReadReceipt extends Document {
  message: Types.ObjectId;
  user: Types.ObjectId;
  readAt: Date;
}

const ReadReceiptSchema = new Schema<IReadReceipt>(
  {
    message: { type: Schema.Types.ObjectId, ref: 'Message', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    readAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ReadReceiptSchema.index({ message: 1, user: 1 }, { unique: true });

export const ReadReceipt = model<IReadReceipt>('ReadReceipt', ReadReceiptSchema);
