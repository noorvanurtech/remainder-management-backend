import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import InAppNotification from '../models/inAppNotification.model';

export const getUserNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const query: any = { user: userId };
    if (unreadOnly === 'true') {
      query.read = false;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [notifications, total, unreadCount] = await Promise.all([
      InAppNotification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      InAppNotification.countDocuments(query),
      InAppNotification.countDocuments({ user: userId, read: false }),
    ]);

    res.status(200).json({
      success: true,
      data: notifications,
      pagination: {
        total,
        unreadCount,
        page: Number(page),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const notification = await InAppNotification.findOneAndUpdate(
      { _id: id, user: userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!notification) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: notification,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;

    await InAppNotification.updateMany(
      { user: userId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?._id;
    const { id } = req.params;

    const result = await InAppNotification.deleteOne({ _id: id, user: userId });

    if (result.deletedCount === 0) {
      res.status(404).json({ success: false, message: 'Notification not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger test email notification directly via API
 */
export const triggerTestEmail = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { targetEmail } = req.body;
    const recipient = targetEmail || req.user?.email || process.env.SMTP_USER || process.env.EMAIL_USER;

    const nodemailerStrategy = (await import('../notification/strategies/nodemailer.strategy')).default;

    const result = await nodemailerStrategy.sendEmail({
      to: recipient,
      subject: 'Production Test Email - Reminder Notification Service',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #4f46e5;">Reminder Notification System Test</h2>
          <p>This is an automated test email sent from your <strong>Production Reminder Backend</strong>.</p>
          <p>Recipient: <strong>${recipient}</strong></p>
          <p>SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}</p>
          <hr />
          <p style="font-size: 12px; color: #888;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${recipient}`,
      messageId: result.messageId,
    });
  } catch (error) {
    next(error);
  }
};

