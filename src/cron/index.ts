import cron from 'node-cron';
import { runBackup } from '../scripts/backup';
import { logger } from '../utils/logger';

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

    // You can easily add more cron jobs here in the future
    // cron.schedule('0 0 * * *', async () => { ... });

    logger.info('Cron Jobs initialized successfully.');
  }
}

export default CronJobManager;
