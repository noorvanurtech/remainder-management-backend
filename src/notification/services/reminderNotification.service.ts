import Reminder, { IReminder } from '../../models/reminder.model';
import User, { IUser } from '../../models/user.model';
import InAppNotification from '../../models/inAppNotification.model';
import NotificationLog from '../../models/notificationLog.model';
import OrganizationEmail from '../../models/organizationEmail.model';
import nodemailerStrategy from '../strategies/nodemailer.strategy';
import notificationGateway from '../gateways/notification.gateway';
import { logger } from '../../utils/logger';

export class ReminderNotificationService {
  /**
   * Main method to evaluate pending reminders and send notifications
   */
  async checkAndSendReminderNotifications(): Promise<void> {
    try {
      logger.info('[ReminderNotificationService] Starting reminder notification check...');
      const now = new Date();

      // Find all pending reminders with populated user
      const reminders = await Reminder.find({ status: 'Pending' }).populate<{ user: IUser }>('user');

      for (const reminder of reminders) {
        if (!reminder.notifyEmail && !reminder.notifyDashboard) {
          continue; // Skip if both notifications are disabled
        }

        const dueDate = new Date(reminder.dueDate);
        const diffMs = dueDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        const schedule = reminder.schedule || 'Monthly';
        const cycleKey = dueDate.toISOString().split('T')[0];

        // Determine applicable stages based on schedule type
        const stagesToTrigger: { stage: string; label: string }[] = [];

        if (schedule === 'Daily') {
          // Testing rules for Daily: 5 hours, 3 hours, 1 hour before due time
          if (diffHours <= 5.2 && diffHours > 3.5) {
            stagesToTrigger.push({ stage: '5_HOURS_BEFORE', label: '5 hours remaining' });
          } else if (diffHours <= 3.5 && diffHours > 1.5) {
            stagesToTrigger.push({ stage: '3_HOURS_BEFORE', label: '3 hours remaining' });
          } else if (diffHours <= 1.5 && diffHours >= -1.0) {
            stagesToTrigger.push({ stage: '1_HOUR_BEFORE', label: '1 hour remaining' });
          }
        } else {
          // Rules for Monthly, 3 Months, 6 Months, Yearly, Custom Date, One-time:
          // 4 days before, 2 days before, 1 day before, current day (due date)
          if (diffDays <= 4.2 && diffDays > 2.5) {
            stagesToTrigger.push({ stage: '4_DAYS_BEFORE', label: '4 days remaining' });
          } else if (diffDays <= 2.5 && diffDays > 1.5) {
            stagesToTrigger.push({ stage: '2_DAYS_BEFORE', label: '2 days remaining' });
          } else if (diffDays <= 1.5 && diffDays > 0.25) {
            stagesToTrigger.push({ stage: '1_DAY_BEFORE', label: '1 day remaining' });
          } else if (diffDays <= 0.25 && diffDays >= -1.0) {
            stagesToTrigger.push({ stage: 'DUE_DATE', label: 'Due today' });
          }
        }

        for (const { stage, label } of stagesToTrigger) {
          await this.processNotificationForStage(reminder, cycleKey, stage, label);
        }
      }

      logger.info('[ReminderNotificationService] Completed reminder notification check.');
    } catch (error) {
      logger.error(`[ReminderNotificationService] Error checking notifications: ${error}`);
    }
  }

  /**
   * Process and dispatch notifications for a specific stage
   */
  private async processNotificationForStage(
    reminder: any,
    cycleKey: string,
    stage: string,
    timeLabel: string
  ): Promise<void> {
    const reminderId = reminder._id;

    // Collect recipient email addresses from OrganizationEmail model (Employee Notification Emails)
    let recipientEmails: string[] = [];
    if (reminder.user && reminder.user._id) {
      const employeeRecords = await OrganizationEmail.find({
        user: reminder.user._id,
        active: true,
      });
      recipientEmails = employeeRecords.map((rec) => rec.email.trim()).filter((e) => e.length > 0);
    }

    // Fallback to primary account user email if no organization employee emails configured
    if (recipientEmails.length === 0 && reminder.user && reminder.user.email) {
      recipientEmails = [reminder.user.email];
    }

    const title = `Reminder Alert: ${reminder.title}`;
    const formattedDueDate = new Date(reminder.dueDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const message = `Reminder "${reminder.title}" (${reminder.category || 'General'}) for client "${reminder.client}" is due on ${formattedDueDate} (${timeLabel}).`;

    // 1. Email Notification
    if (reminder.notifyEmail && recipientEmails.length > 0) {
      const emailLogExists = await NotificationLog.findOne({
        reminder: reminderId,
        cycleKey,
        stage,
        channel: 'email',
      });

      if (!emailLogExists) {
        try {
          const htmlContent = this.generateEmailTemplate({
            title: reminder.title,
            client: reminder.client,
            category: reminder.category,
            description: reminder.description,
            dueDate: formattedDueDate,
            timeLabel,
            cycle: reminder.cycle,
            schedule: reminder.schedule,
          });

          await nodemailerStrategy.sendEmail({
            to: recipientEmails.join(', '),
            subject: `${title} (${timeLabel})`,
            html: htmlContent,
          });

          await NotificationLog.create({
            reminder: reminderId,
            cycleKey,
            stage,
            channel: 'email',
            sentAt: new Date(),
          });

          logger.info(`[ReminderNotificationService] Sent email notification to [${recipientEmails.join(', ')}] for reminder [${reminder.title}] (Stage: ${stage})`);
        } catch (emailErr) {
          logger.error(`[ReminderNotificationService] Failed to send email for reminder [${reminderId}]: ${emailErr}`);
        }
      }
    }

    // 2. Dashboard In-App Notification
    if (reminder.notifyDashboard && reminder.user) {
      const dashLogExists = await NotificationLog.findOne({
        reminder: reminderId,
        cycleKey,
        stage,
        channel: 'dashboard',
      });

      if (!dashLogExists) {
        try {
          const inAppNotification = await InAppNotification.create({
            user: reminder.user._id,
            reminder: reminderId,
            title,
            message,
            stage,
            dueDate: reminder.dueDate,
            read: false,
          });

          // Emit real-time Socket.IO notification to user dashboard
          notificationGateway.sendToUser(
            reminder.user._id.toString(),
            'dashboard_notification',
            inAppNotification
          );

          await NotificationLog.create({
            reminder: reminderId,
            cycleKey,
            stage,
            channel: 'dashboard',
            sentAt: new Date(),
          });

          logger.info(`[ReminderNotificationService] Created dashboard notification for user [${reminder.user._id}] for reminder [${reminder.title}] (Stage: ${stage})`);
        } catch (dashErr) {
          logger.error(`[ReminderNotificationService] Failed to create dashboard notification for reminder [${reminderId}]: ${dashErr}`);
        }
      }
    }
  }

  /**
   * HTML template generator for email alerts
   */
  private generateEmailTemplate(data: {
    title: string;
    client: string;
    category: string;
    description?: string;
    dueDate: string;
    timeLabel: string;
    cycle?: string;
    schedule: string;
  }): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 600px; background: #ffffff; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
          .header { background: linear-gradient(135deg, #4f46e5, #3b82f6); color: #ffffff; padding: 24px; text-align: center; }
          .header h1 { margin: 0; font-size: 22px; font-weight: 600; }
          .content { padding: 24px; }
          .badge { display: inline-block; background-color: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 16px; }
          .detail-card { background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin: 16px 0; border-radius: 4px; }
          .detail-item { margin-bottom: 8px; font-size: 14px; }
          .detail-item strong { color: #1e293b; }
          .footer { background-color: #f1f5f9; text-align: center; padding: 16px; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reminder Alert</h1>
          </div>
          <div class="content">
            <span class="badge">${data.timeLabel.toUpperCase()}</span>
            <p>Hello,</p>
            <p>This is an automated notification regarding an upcoming reminder due on your schedule.</p>
            <div class="detail-card">
              <div class="detail-item"><strong>Title:</strong> ${data.title}</div>
              <div class="detail-item"><strong>Client:</strong> ${data.client}</div>
              <div class="detail-item"><strong>Category:</strong> ${data.category}</div>
              <div class="detail-item"><strong>Schedule:</strong> ${data.schedule} ${data.cycle ? `(${data.cycle})` : ''}</div>
              <div class="detail-item"><strong>Due Date & Time:</strong> ${data.dueDate}</div>
              ${data.description ? `<div class="detail-item"><strong>Description:</strong> ${data.description}</div>` : ''}
            </div>
            <p>Please log in to your dashboard to view or manage this reminder.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Reminder Management System. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new ReminderNotificationService();
