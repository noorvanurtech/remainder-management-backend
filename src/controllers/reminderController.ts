import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import reminderService from '../services/reminderService';
import { STATUS } from '../constants/messages';

export const createReminder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const reminder = await reminderService.createReminder(userId, req.body);

    res.status(201).json({
      status: STATUS.SUCCESS,
      message: 'Reminder created successfully',
      data: reminder,
    });
  } catch (err) {
    res.status(500).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};

export const getAllReminders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const { reminders, total } = await reminderService.getAllReminders(userId, req.query);

    res.status(200).json({
      status: STATUS.SUCCESS,
      results: total,
      data: reminders,
    });
  } catch (err) {
    res.status(500).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};

export const getReminderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const reminderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reminder = await reminderService.getReminderById(userId, reminderId);

    res.status(200).json({
      status: STATUS.SUCCESS,
      data: reminder,
    });
  } catch (err) {
    res.status(404).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};

export const updateReminder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const reminderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const reminder = await reminderService.updateReminder(userId, reminderId, req.body);

    res.status(200).json({
      status: STATUS.SUCCESS,
      message: 'Reminder updated successfully',
      data: reminder,
    });
  } catch (err) {
    res.status(400).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};

export const deleteReminder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req.user as any).id;
    const reminderId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await reminderService.deleteReminder(userId, reminderId);

    res.status(200).json({
      status: STATUS.SUCCESS,
      message: 'Reminder deleted successfully',
    });
  } catch (err) {
    res.status(404).json({
      status: STATUS.FAIL,
      message: (err as Error).message,
    });
  }
};
