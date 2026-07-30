import 'dotenv/config';
import connectDB from '../config/db';
import User from '../models/user.model';
import Reminder from '../models/reminder.model';
import OrganizationEmail from '../models/organizationEmail.model';
import reminderNotificationService from '../notification/services/reminderNotification.service';
import nodemailerStrategy from '../notification/strategies/nodemailer.strategy';
import { logger } from '../utils/logger';

export const runTestEmailNotification = async () => {
  try {
    logger.info('Connecting to Database for Email Test...');
    await connectDB();

    const targetEmail = process.env.SMTP_USER || process.env.EMAIL_USER || 'noorfatmanoor411@gmail.com';
    logger.info(`Sending direct test email to: ${targetEmail}`);

    const directResult = await nodemailerStrategy.sendEmail({
      to: targetEmail,
      subject: 'Test Email - Reminder Management Notification Service',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Reminder Notification System Test</h2>
          <p>This is a test email sent from your <strong>Reminder Management Backend Notification Service</strong>.</p>
          <p>If you are receiving this email, your SMTP settings and Gmail integration are working perfectly on your environment!</p>
          <hr />
          <p style="font-size: 12px; color: #888;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    logger.info(`Direct email test SUCCESS! Message ID: ${directResult.messageId}`);

    logger.info('\nTesting full ReminderNotificationService check...');
    
    let user = await User.findOne({});
    if (!user) {
      user = await User.create({
        name: 'Test User',
        email: targetEmail,
        password: 'Password123!',
        role: 'user',
        status: 'Active',
      });
    }

    const dueDate1Hour = new Date(Date.now() + 50 * 60 * 1000); // 50 minutes from now

    await Reminder.deleteMany({ title: 'TEST AUTOMATED REMINDER EMAIL' });

    await OrganizationEmail.findOneAndUpdate(
      { user: user._id, email: targetEmail },
      { user: user._id, email: targetEmail, name: 'Employee Test Recipient', active: true },
      { upsert: true, returnDocument: 'after' }
    );

    const testReminder = await Reminder.create({
      user: user._id,
      title: 'TEST AUTOMATED REMINDER EMAIL',
      description: 'Testing organization employee emails and dashboard notifications.',
      client: 'Test Client Ltd.',
      category: 'General',
      status: 'Pending',
      dueDate: dueDate1Hour,
      schedule: 'Daily',
      notifyEmail: true,
      notifyDashboard: true,
    });

    logger.info(`Created test reminder [${(testReminder as any)._id}] due at ${dueDate1Hour.toISOString()}`);

    await reminderNotificationService.checkAndSendReminderNotifications();

    logger.info('\nFull Notification Service test completed cleanly!');
    return { success: true, messageId: directResult.messageId };
  } catch (error) {
    logger.error(`Error during email notification test: ${error}`);
    throw error;
  }
};

if (require.main === module) {
  runTestEmailNotification()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
