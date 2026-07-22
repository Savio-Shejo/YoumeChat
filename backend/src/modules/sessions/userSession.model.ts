import { Schema, model, Document, Types } from 'mongoose';

export interface IUserSession extends Document {
  user: Types.ObjectId;
  sessionId: string;
  deviceId: string;
  deviceFingerprint: string;
  ipAddress: string;
  userAgent: string;
  refreshTokenHash: string;
  isRevoked: boolean;
  expiresAt: Date;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSessionSchema = new Schema<IUserSession>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sessionId: { type: String, required: true, unique: true, index: true },
    deviceId: { type: String, required: true },
    deviceFingerprint: { type: String, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    refreshTokenHash: { type: String, required: true },
    isRevoked: { type: Boolean, default: false, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

UserSessionSchema.index({ user: 1, deviceId: 1 });

export const UserSession = model<IUserSession>('UserSession', UserSessionSchema);
