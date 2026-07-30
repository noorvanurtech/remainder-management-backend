import mongoose, { Schema, Document } from 'mongoose';

export interface IInAppNotification extends Document {
  user: mongoose.Types.ObjectId;
  reminder: mongoose.Types.ObjectId;
  title: string;
  message: string;
  stage: string;
  read: boolean;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InAppNotificationSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reminder: {
      type: Schema.Types.ObjectId,
      ref: 'Reminder',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    stage: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

InAppNotificationSchema.index({ user: 1, read: 1, createdAt: -1 });

const InAppNotification = mongoose.model<IInAppNotification>('InAppNotification', InAppNotificationSchema);
export default InAppNotification;
