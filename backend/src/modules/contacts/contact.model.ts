import { Schema, model, Document, Types } from 'mongoose';

export interface IContact extends Document {
  user: Types.ObjectId;
  contactUser: Types.ObjectId;
  alias?: string;
  isFavorite: boolean;
  createdAt: Date;
}

const ContactSchema = new Schema<IContact>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contactUser: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    alias: { type: String, default: '' },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

ContactSchema.index({ user: 1, contactUser: 1 }, { unique: true });

export const Contact = model<IContact>('Contact', ContactSchema);
