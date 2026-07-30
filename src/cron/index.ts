import cron from 'node-cron';
import { runBackup } from '../scripts/backup';
import { logger } from '../utils/logger';
import reminderNotificationService from '../notification/services/reminderNotification.service';

class CronJobManager {
  public static initialize() {
    logger.info('Initializing Cron Jobs...');

    // Database Backup: Temporary testing schedule (11:40 AM IST)
    cron.schedule('10 13 * * *', async () => {
      logger.info('Cron triggered: Nightly Database Backup');
      try {
        await runBackup();
        logger.info('Cron completed: Nightly Database Backup');
      } catch (error) {
        logger.error(`Cron failed: Nightly Database Backup - ${error}`);
      }
    }, {
      timezone: "Asia/Kolkata"
    });

    // Check & dispatch reminder notifications (email & dashboard) every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      logger.info('Cron triggered: Reminder Notifications Check');
      try {
        await reminderNotificationService.checkAndSendReminderNotifications();
        logger.info('Cron completed: Reminder Notifications Check');
      } catch (error) {
        logger.error(`Cron failed: Reminder Notifications Check - ${error}`);
      }
    });

    logger.info('Cron Jobs initialized successfully.');
  }
}

export default CronJobManager;
