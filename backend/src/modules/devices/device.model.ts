import { Schema, model, Document, Types, models } from 'mongoose';

export interface IDevice extends Document {
  user: Types.ObjectId;
  fcmToken: string;
  deviceId: string;
  platform: 'android' | 'ios' | 'web' | 'desktop';
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DeviceSchema = new Schema<IDevice>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fcmToken: { type: String, required: true, unique: true },
    deviceId: { type: String, required: true },
    platform: {
      type: String,
      enum: ['android', 'ios', 'web', 'desktop'],
      default: 'android',
    },
    lastActive: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

DeviceSchema.index({ user: 1, deviceId: 1 });

export const Device = models.Device || model<IDevice>('Device', DeviceSchema);
