import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationLog extends Document {
  reminder: mongoose.Types.ObjectId;
  cycleKey: string;
  stage: string;
  channel: 'email' | 'dashboard';
  sentAt: Date;
}

const NotificationLogSchema: Schema = new Schema(
  {
    reminder: {
      type: Schema.Types.ObjectId,
      ref: 'Reminder',
      required: true,
      index: true,
    },
    cycleKey: {
      type: String,
      required: true,
      index: true,
    },
    stage: {
      type: String,
      required: true,
    },
    channel: {
      type: String,
      enum: ['email', 'dashboard'],
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index to quickly prevent duplicates
NotificationLogSchema.index({ reminder: 1, cycleKey: 1, stage: 1, channel: 1 }, { unique: true });

const NotificationLog = mongoose.model<INotificationLog>('NotificationLog', NotificationLogSchema);
export default NotificationLog;
