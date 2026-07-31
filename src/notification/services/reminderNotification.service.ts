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
   * Main method to evaluate pending and overdue reminders and send notifications
   */
  async checkAndSendReminderNotifications(): Promise<void> {
    try {
      logger.info('[ReminderNotificationService] Starting reminder notification check...');
      const now = new Date();

      // Find all pending and overdue reminders with populated user
      const reminders = await Reminder.find({
        status: { $in: ['Pending', 'Overdue'] },
      }).populate<{ user: IUser }>('user');

      for (const reminder of reminders) {
        if (!reminder.notifyEmail && !reminder.notifyDashboard) {
          continue; // Skip if both notifications are disabled
        }

        const dueDate = new Date(reminder.dueDate);

        // Auto-mark status as Overdue in DB if due date has passed
        if (dueDate < now && reminder.status === 'Pending') {
          reminder.status = 'Overdue';
          await Reminder.updateOne({ _id: reminder._id }, { status: 'Overdue' });
        }

        const diffMs = dueDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        const schedule = reminder.schedule || 'Monthly';
        const cycleKey = dueDate.toISOString().split('T')[0];

        // Determine applicable stages based on schedule type
        const stagesToTrigger: { stage: string; label: string }[] = [];

        if (schedule === 'Daily') {
          // Pre-due stages for Daily: 5 hours, 3 hours, 1 hour before due time
          if (diffHours <= 5.2 && diffHours > 3.5) {
            stagesToTrigger.push({ stage: '5_HOURS_BEFORE', label: '5 hours remaining' });
          } else if (diffHours <= 3.5 && diffHours > 1.5) {
            stagesToTrigger.push({ stage: '3_HOURS_BEFORE', label: '3 hours remaining' });
          } else if (diffHours <= 1.5 && diffHours >= -0.2) {
            stagesToTrigger.push({ stage: '1_HOUR_BEFORE', label: '1 hour remaining' });
          }
          // Overdue stages for Daily
          else if (diffHours < -0.2 && diffHours >= -3.0) {
            stagesToTrigger.push({ stage: 'OVERDUE_IMMEDIATE', label: 'Overdue (Notice)' });
          } else if (diffHours < -3.0 && diffHours >= -12.0) {
            stagesToTrigger.push({ stage: 'OVERDUE_6_HOURS', label: 'Overdue (6 hours)' });
          } else if (diffHours < -12.0 && diffHours >= -36.0) {
            stagesToTrigger.push({ stage: 'OVERDUE_1_DAY', label: 'Overdue (1 day)' });
          }
        } else {
          // Rules for Monthly, 3 Months, 6 Months, Yearly, Custom Date, One-time:
          // Pre-due stages: 4 days, 2 days, 1 day, due date
          if (diffDays <= 4.2 && diffDays > 2.5) {
            stagesToTrigger.push({ stage: '4_DAYS_BEFORE', label: '4 days remaining' });
          } else if (diffDays <= 2.5 && diffDays > 1.5) {
            stagesToTrigger.push({ stage: '2_DAYS_BEFORE', label: '2 days remaining' });
          } else if (diffDays <= 1.5 && diffDays > 0.25) {
            stagesToTrigger.push({ stage: '1_DAY_BEFORE', label: '1 day remaining' });
          } else if (diffDays <= 0.25 && diffDays >= -0.2) {
            stagesToTrigger.push({ stage: 'DUE_DATE', label: 'Due today' });
          }
          // Overdue stages: Immediate, 1 Day, 3 Days, 7 Days overdue
          else if (diffDays < -0.2 && diffDays >= -1.2) {
            stagesToTrigger.push({ stage: 'OVERDUE_IMMEDIATE', label: 'Overdue (Action Required)' });
          } else if (diffDays < -1.2 && diffDays >= -2.5) {
            stagesToTrigger.push({ stage: 'OVERDUE_1_DAY', label: 'Overdue (1 day)' });
          } else if (diffDays < -2.5 && diffDays >= -5.0) {
            stagesToTrigger.push({ stage: 'OVERDUE_3_DAYS', label: 'Overdue (3 days)' });
          } else if (diffDays < -5.0 && diffDays >= -10.0) {
            stagesToTrigger.push({ stage: 'OVERDUE_7_DAYS', label: 'Critical Overdue (7 days)' });
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
    const isOverdue = stage.startsWith('OVERDUE');

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

    const title = isOverdue
      ? `⚠️ OVERDUE ALERT: ${reminder.title}`
      : `Reminder Alert: ${reminder.title}`;

    const formattedStartDate = reminder.startDate
      ? new Date(reminder.startDate).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : undefined;

    const formattedDueDate = new Date(reminder.dueDate).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const message = isOverdue
      ? `URGENT: Reminder "${reminder.title}" (${reminder.category || 'General'}) for client "${reminder.client}" was due on ${formattedDueDate} and is OVERDUE (${timeLabel}). Please log in to complete or reschedule.`
      : `Reminder "${reminder.title}" (${reminder.category || 'General'}) for client "${reminder.client}" is due on ${formattedDueDate} (${timeLabel}).`;

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
            startDate: formattedStartDate,
            dueDate: formattedDueDate,
            timeLabel,
            cycle: reminder.cycle,
            schedule: reminder.schedule,
            status: reminder.status || (isOverdue ? 'Overdue' : 'Pending'),
            isOverdue,
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
    startDate?: string;
    dueDate: string;
    timeLabel: string;
    cycle?: string;
    schedule: string;
    status: string;
    isOverdue?: boolean;
  }): string {
    const isOverdue = data.isOverdue || data.status === 'Overdue';

    const headerBg = isOverdue
      ? 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)'
      : 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)';

    const buttonBg = isOverdue
      ? 'linear-gradient(135deg, #dc2626, #991b1b)'
      : 'linear-gradient(135deg, #4f46e5, #3730a3)';

    const alertBoxBg = isOverdue ? '#fef2f2' : '#eff6ff';
    const alertBoxBorder = isOverdue ? '#fecaca' : '#bfdbfe';
    const alertTextColor = isOverdue ? '#991b1b' : '#1e40af';
    const alertIcon = isOverdue ? '⚠️' : '⏰';

    const statusPillClass = isOverdue ? 'pill-status-overdue' : 'pill-status-pending';
    const appUrl = process.env.APP_URL || 'http://localhost:3000';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${isOverdue ? 'Overdue Reminder Alert' : 'Reminder Notification'}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f1f5f9;
            margin: 0;
            padding: 24px 12px;
            color: #1e293b;
            line-height: 1.5;
          }
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
            border: 1px solid #e2e8f0;
          }
          .email-header {
            background: ${headerBg};
            padding: 32px 28px;
            color: #ffffff;
          }
          .header-badge {
            display: inline-block;
            background-color: rgba(255, 255, 255, 0.2);
            color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 4px 12px;
            border-radius: 20px;
            margin-bottom: 12px;
          }
          .header-title {
            margin: 0;
            font-size: 22px;
            font-weight: 700;
            color: #ffffff;
            line-height: 1.3;
          }
          .email-body {
            padding: 28px;
          }
          .alert-banner {
            background-color: ${alertBoxBg};
            border: 1px solid ${alertBoxBorder};
            color: ${alertTextColor};
            padding: 14px 18px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 24px;
            display: flex;
            align-items: center;
          }
          .alert-icon {
            font-size: 18px;
            margin-right: 10px;
          }
          .section-heading {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #64748b;
            margin-bottom: 12px;
          }
          .details-card {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            background-color: #f8fafc;
            border-radius: 10px;
            border: 1px solid #e2e8f0;
            overflow: hidden;
            margin-bottom: 24px;
          }
          .details-card tr {
            border-bottom: 1px solid #f1f5f9;
          }
          .details-card tr:last-child {
            border-bottom: none;
          }
          .details-card td {
            padding: 12px 16px;
            font-size: 13.5px;
            vertical-align: middle;
          }
          .label-cell {
            width: 35%;
            color: #64748b;
            font-weight: 600;
            background-color: #fafafa;
            border-right: 1px solid #f1f5f9;
          }
          .value-cell {
            color: #0f172a;
            font-weight: 500;
          }
          .badge-pill {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
          }
          .badge-category {
            background-color: #dbeafe;
            color: #1e40af;
          }
          .badge-client {
            background-color: #f3e8ff;
            color: #6b21a8;
          }
          .pill-status-overdue {
            background-color: #fee2e2;
            color: #991b1b;
          }
          .pill-status-pending {
            background-color: #fef3c7;
            color: #92400e;
          }
          .description-box {
            background-color: #f8fafc;
            border-left: 4px solid #4f46e5;
            padding: 14px 16px;
            border-radius: 4px;
            margin-bottom: 24px;
            font-size: 13.5px;
            color: #334155;
            line-height: 1.6;
          }
          .cta-wrapper {
            text-align: center;
            margin: 28px 0 16px 0;
          }
          .cta-btn {
            display: inline-block;
            background: ${buttonBg};
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
            padding: 12px 30px;
            border-radius: 8px;
            box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2);
          }
          .email-footer {
            background-color: #f8fafc;
            padding: 20px 28px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            font-size: 12px;
            color: #94a3b8;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            <span class="header-badge">${isOverdue ? 'URGENT ATTENTION' : 'NOTIFICATION'}</span>
            <h1 class="header-title">${data.title}</h1>
          </div>
          <div class="email-body">
            <div class="alert-banner">
              <span class="alert-icon">${alertIcon}</span>
              <span><strong>${data.timeLabel.toUpperCase()}</strong>: ${isOverdue ? 'This task is overdue and requires action.' : 'Upcoming reminder on your schedule.'}</span>
            </div>

            <div class="section-heading">Reminder Specifications</div>
            <table class="details-card">
              <tr>
                <td class="label-cell">Client Name</td>
                <td class="value-cell"><span class="badge-pill badge-client">${data.client}</span></td>
              </tr>
              <tr>
                <td class="label-cell">Category</td>
                <td class="value-cell"><span class="badge-pill badge-category">${data.category}</span></td>
              </tr>
              <tr>
                <td class="label-cell">Current Status</td>
                <td class="value-cell"><span class="badge-pill ${statusPillClass}">${data.status}</span></td>
              </tr>
              <tr>
                <td class="label-cell">Schedule Pattern</td>
                <td class="value-cell">${data.schedule} ${data.cycle ? `(${data.cycle})` : ''}</td>
              </tr>
              ${data.startDate ? `
              <tr>
                <td class="label-cell">Start Date</td>
                <td class="value-cell">${data.startDate}</td>
              </tr>
              ` : ''}
              <tr>
                <td class="label-cell">Due Date & Time</td>
                <td class="value-cell" style="color: ${isOverdue ? '#dc2626' : '#0f172a'}; font-weight: 700;">${data.dueDate}</td>
              </tr>
            </table>

            ${data.description ? `
            <div class="section-heading">Description & Notes</div>
            <div class="description-box">
              ${data.description}
            </div>
            ` : ''}

            <div class="cta-wrapper">
              <a href="${appUrl}" target="_blank" class="cta-btn">Open Dashboard & Take Action</a>
            </div>
          </div>
          <div class="email-footer">
            Sent by <strong>Reminder Management System</strong> &bull; Automated System Notification<br>
            Please do not reply directly to this email.
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default new ReminderNotificationService();
