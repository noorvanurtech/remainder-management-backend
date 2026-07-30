import mongoose, { Schema, Document } from 'mongoose';

export interface IOrganizationEmail extends Document {
  user: mongoose.Types.ObjectId;
  name?: string;
  email: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrganizationEmailSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

OrganizationEmailSchema.index({ user: 1, email: 1 }, { unique: true });

const OrganizationEmail = mongoose.model<IOrganizationEmail>('OrganizationEmail', OrganizationEmailSchema);
export default OrganizationEmail;
