import express, { Request, Response } from 'express';
import reminderNotificationService from '../notification/services/reminderNotification.service';
import { runBackup } from '../scripts/backup';
import { logger } from '../utils/logger';

const router = express.Router();

// Middleware to verify Vercel Cron Secret or allowed trigger authorization
const verifyCronSecret = (req: Request, res: Response, next: express.NextFunction) => {
  const cronSecret = process.env.CRON_SECRET;
  
  // If CRON_SECRET is configured in environment variables, enforce authorization header
  if (cronSecret) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.warn(`Unauthorized cron trigger attempt from IP: ${req.ip}`);
      return res.status(401).json({ success: false, error: 'Unauthorized cron request' });
    }
  }
  next();
};

/**
 * GET /api/v1/cron/check-reminders
 * Trigger reminder notification check (dispatch email & in-app notifications)
 */
router.get('/check-reminders', verifyCronSecret, async (req: Request, res: Response) => {
  logger.info('[Cron API] Triggered: Reminder Notifications Check');
  const startTime = Date.now();

  try {
    await reminderNotificationService.checkAndSendReminderNotifications();
    const duration = Date.now() - startTime;
    logger.info(`[Cron API] Completed: Reminder Notifications Check (${duration}ms)`);

    return res.status(200).json({
      success: true,
      message: 'Reminder notifications check completed successfully',
      durationMs: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error(`[Cron API] Failed: Reminder Notifications Check - ${error?.message || error}`);
    return res.status(500).json({
      success: false,
      error: 'Failed to process reminder notifications check',
      details: error?.message || String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/v1/cron/backup
 * Trigger database backup
 */
router.get('/backup', verifyCronSecret, async (req: Request, res: Response) => {
  logger.info('[Cron API] Triggered: Nightly Database Backup');
  const startTime = Date.now();

  try {
    await runBackup();
    const duration = Date.now() - startTime;
    logger.info(`[Cron API] Completed: Nightly Database Backup (${duration}ms)`);

    return res.status(200).json({
      success: true,
      message: 'Database backup completed successfully',
      durationMs: duration,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    logger.error(`[Cron API] Failed: Nightly Database Backup - ${error?.message || error}`);
    return res.status(500).json({
      success: false,
      error: 'Failed to complete database backup',
      details: error?.message || String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
