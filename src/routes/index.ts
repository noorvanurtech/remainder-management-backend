import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import reminderRoutes from './reminderRoutes';
import clientRoutes from './clientRoutes';
import categoryRoutes from './categoryRoutes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/reminders', reminderRoutes);
router.use('/clients', clientRoutes);
router.use('/categories', categoryRoutes);

export default router;






