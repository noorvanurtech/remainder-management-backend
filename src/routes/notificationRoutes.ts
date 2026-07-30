import express from 'express';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  triggerTestEmail,
} from '../controllers/notification.controller';
import { protect, optionalAuth } from '../middleware/auth.middleware';

const router = express.Router();

// Allow test email endpoint with optional authentication (no 401 error if token is not sent)
router.post('/test-email', optionalAuth, triggerTestEmail);

// User dashboard notification routes require authentication
router.use(protect);

router.get('/', getUserNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

export default router;
