import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import reminderRoutes from './reminderRoutes';
import clientRoutes from './clientRoutes';
import categoryRoutes from './categoryRoutes';
import notificationRoutes from './notificationRoutes';
import organizationEmailRoutes from './organizationEmailRoutes';
import cronRoutes from './cronRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/reminders', reminderRoutes);
router.use('/clients', clientRoutes);
router.use('/categories', categoryRoutes);
router.use('/notifications', notificationRoutes);
router.use('/organization-emails', organizationEmailRoutes);
router.use('/cron', cronRoutes);

export default router;






