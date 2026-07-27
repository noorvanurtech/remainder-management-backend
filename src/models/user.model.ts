import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, ALL_ROLES, STATUS, ALL_STATUSES } from '../constants/index';

export interface IUser extends Document {
  workshopId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  password?: string;
  role: string;
  permissions: string[];
  status: string;
  profileImage?: string;
  otp?: {
    code: string;
    expiresAt: Date;
  };
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    workshopId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: false,
      trim: true,
      default: undefined,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ALL_ROLES,
      required: true,
      index: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ALL_STATUSES,
      default: STATUS.ACTIVE,
      index: true,
    },
    profileImage: {
      type: String,
      default: null,
    },
    otp: {
      code: { type: String },
      expiresAt: { type: Date },
    },
    lastLogin: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(doc, ret: any) {
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      transform(doc, ret: any) {
        delete ret.password;
        return ret;
      },
    },
  },
);

// Recommended Indexes
UserSchema.index({ email: 1, status: 1 });
UserSchema.index({ workshopId: 1, role: 1 });
UserSchema.index(
  { phone: 1 },
  { unique: true, partialFilterExpression: { phone: { $type: 'string' } } }
);

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (
  enteredPassword: string,
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password || '');
};

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
