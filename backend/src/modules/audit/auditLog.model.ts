import { Schema, model, Document, Types } from 'mongoose';

export interface IAuditLog extends Document {
  actor: Types.ObjectId;
  action: string;
  targetType?: string;
  targetId?: string;
  ipAddress?: string;
  details?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    action: { type: String, required: true, index: true },
    targetType: String,
    targetId: String,
    ipAddress: String,
    details: Schema.Types.Mixed,
  },
  { timestamps: true }
);

export const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);
