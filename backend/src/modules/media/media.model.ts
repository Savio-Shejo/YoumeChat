import { Schema, model, Document, Types } from 'mongoose';

export interface IMedia extends Document {
  uploader: Types.ObjectId;
  publicId: string;
  url: string;
  thumbnailUrl?: string;
  format: string;
  resourceType: 'image' | 'video' | 'raw' | 'audio';
  bytes: number;
  width?: number;
  height?: number;
  duration?: number;
  isVirusScanned: boolean;
  createdAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    uploader: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    publicId: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    thumbnailUrl: { type: String },
    format: { type: String, required: true },
    resourceType: { type: String, enum: ['image', 'video', 'raw', 'audio'], required: true },
    bytes: { type: Number, required: true },
    width: Number,
    height: Number,
    duration: Number,
    isVirusScanned: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Media = model<IMedia>('Media', MediaSchema);
