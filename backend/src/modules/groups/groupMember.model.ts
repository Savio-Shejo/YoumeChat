import { Schema, model, Document, Types } from 'mongoose';

export type GroupRole = 'Owner' | 'Admin' | 'Member';

export interface IGroupMember extends Document {
  group: Types.ObjectId;
  user: Types.ObjectId;
  role: GroupRole;
  joinedAt: Date;
}

const GroupMemberSchema = new Schema<IGroupMember>(
  {
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    role: { type: String, enum: ['Owner', 'Admin', 'Member'], default: 'Member', index: true },
    joinedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

GroupMemberSchema.index({ group: 1, user: 1 }, { unique: true });

export const GroupMember = model<IGroupMember>('GroupMember', GroupMemberSchema);
