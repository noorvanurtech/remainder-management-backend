import mongoose, { Schema, Document } from 'mongoose';

export interface IReminder extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  client: string;
  category: string;
  cycle?: string;
  status: 'Pending' | 'Overdue' | 'Completed' | 'Cancelled';
  dueDate: Date;
  startDate?: Date;
  endDate?: Date;
  schedule: 'Daily' | 'Monthly' | '3 Months' | '6 Months' | 'Yearly' | 'Custom Date' | 'One-time';
  repeat: boolean;
  notifyEmail: boolean;
  notifyDashboard: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReminderSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Reminder title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    client: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Reminder category is required'],
      trim: true,
      index: true,
    },
    cycle: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Overdue', 'Completed', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
      index: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    schedule: {
      type: String,
      enum: ['Daily', 'Monthly', '3 Months', '6 Months', 'Yearly', 'Custom Date', 'One-time'],
      default: 'Monthly',
    },
    repeat: {
      type: Boolean,
      default: false,
    },
    notifyEmail: {
      type: Boolean,
      default: true,
    },
    notifyDashboard: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Indexes for fast searching and filtering
ReminderSchema.index({ user: 1, status: 1, dueDate: 1 });
ReminderSchema.index({ user: 1, category: 1 });

const Reminder = mongoose.model<IReminder>('Reminder', ReminderSchema);
export default Reminder;
