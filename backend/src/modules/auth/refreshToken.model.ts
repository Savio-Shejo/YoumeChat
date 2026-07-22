import { Schema, model, Document, Types, models } from 'mongoose';

export interface IRefreshToken extends Document {
  user: Types.ObjectId;
  token: string;
  deviceId?: string;
  expiresAt: Date;
  createdAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    deviceId: { type: String },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

export const RefreshToken = models.RefreshToken || model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
