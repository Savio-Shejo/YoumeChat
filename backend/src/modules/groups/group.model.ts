import { Schema, model, Document, Types, models } from 'mongoose';

export interface IGroup extends Document {
  chat: Types.ObjectId;
  name: string;
  description?: string;
  avatarUrl?: string;
  admins: Types.ObjectId[];
  creator: Types.ObjectId;
  memberPermissions: {
    sendMessages: boolean;
    editGroupInfo: boolean;
    addMembers: boolean;
  };
  inviteCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    admins: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    memberPermissions: {
      sendMessages: { type: Boolean, default: true },
      editGroupInfo: { type: Boolean, default: false },
      addMembers: { type: Boolean, default: true },
    },
    inviteCode: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

export const Group = models.Group || model<IGroup>('Group', GroupSchema);
