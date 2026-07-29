import express from 'express';
import {
  createReminder,
  getAllReminders,
  getReminderById,
  updateReminder,
  deleteReminder,
} from '../controllers/reminderController';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate';
import {
  createReminderSchema,
  updateReminderSchema,
} from '../validations/reminder.validation';

const router = express.Router();

// All reminder routes require authentication
router.use(protect);

router
  .route('/')
  .post(validate(createReminderSchema), createReminder)
  .get(getAllReminders);

router
  .route('/:id')
  .get(getReminderById)
  .patch(validate(updateReminderSchema), updateReminder)
  .delete(deleteReminder);

export default router;
