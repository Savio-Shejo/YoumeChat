import { Schema, model, Document, Types } from 'mongoose';

export interface IDeletedMessage extends Document {
  message: Types.ObjectId;
  user: Types.ObjectId;
  deletedAt: Date;
}

const DeletedMessageSchema = new Schema<IDeletedMessage>(
  {
    message: { type: Schema.Types.ObjectId, ref: 'Message', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deletedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

DeletedMessageSchema.index({ message: 1, user: 1 }, { unique: true });

export const DeletedMessage = model<IDeletedMessage>('DeletedMessage', DeletedMessageSchema);
