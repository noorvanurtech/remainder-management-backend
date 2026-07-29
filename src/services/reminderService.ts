import Reminder, { IReminder } from '../models/reminder.model';
import Client from '../models/client.model';
import Category from '../models/category.model';
import { MESSAGES } from '../constants/messages';

class ReminderService {
  /**
   * Helper to calculate next cycle dates for repeating reminders
   */
  private calculateNextDates(reminder: IReminder): { dueDate: Date; startDate?: Date; endDate?: Date } {
    const currentDue = new Date(reminder.dueDate || new Date());
    let nextDue = new Date(currentDue);
    let nextStart: Date | undefined;
    let nextEnd: Date | undefined;

    const schedule = reminder.schedule || 'Monthly';

    if (schedule === 'Monthly') {
      nextDue.setMonth(nextDue.getMonth() + 1);
    } else if (schedule === '3 Months') {
      nextDue.setMonth(nextDue.getMonth() + 3);
    } else if (schedule === '6 Months') {
      nextDue.setMonth(nextDue.getMonth() + 6);
    } else if (schedule === 'Yearly') {
      nextDue.setFullYear(nextDue.getFullYear() + 1);
    } else if (schedule === 'Custom Date' && reminder.startDate && reminder.endDate) {
      const duration = new Date(reminder.endDate).getTime() - new Date(reminder.startDate).getTime();
      const validDuration = duration > 0 ? duration : 30 * 24 * 60 * 60 * 1000;
      nextStart = new Date(reminder.endDate);
      nextEnd = new Date(nextStart.getTime() + validDuration);
      nextDue = new Date(nextEnd);
    } else {
      nextDue.setMonth(nextDue.getMonth() + 1);
    }

    if (reminder.startDate && !nextStart) {
      nextStart = new Date(reminder.startDate);
      if (schedule === 'Monthly') nextStart.setMonth(nextStart.getMonth() + 1);
      else if (schedule === '3 Months') nextStart.setMonth(nextStart.getMonth() + 3);
      else if (schedule === '6 Months') nextStart.setMonth(nextStart.getMonth() + 6);
      else if (schedule === 'Yearly') nextStart.setFullYear(nextStart.getFullYear() + 1);
    }

    if (reminder.endDate && !nextEnd) {
      nextEnd = new Date(nextDue);
    }

    return { dueDate: nextDue, startDate: nextStart, endDate: nextEnd };
  }

  /**
   * Helper to increment cycle string (e.g. "cycle 1" -> "cycle 2")
   */
  private incrementCycle(cycle?: string): string {
    if (!cycle) return 'cycle 2';
    const match = cycle.match(/cycle\s*(\d+)/i);
    if (match && match[1]) {
      const num = parseInt(match[1], 10) + 1;
      return `cycle ${num}`;
    }
    return `${cycle} (next)`;
  }

  /**
   * Create a new reminder
   */
  async createReminder(userId: string, data: any): Promise<IReminder> {
    const reminderData: any = {
      ...data,
      user: userId,
      dueDate: new Date(data.dueDate),
    };

    if (data.startDate) {
      reminderData.startDate = new Date(data.startDate);
    }
    if (data.endDate) {
      reminderData.endDate = new Date(data.endDate);
    }

    if (reminderData.repeat && !reminderData.cycle) {
      reminderData.cycle = 'cycle 1';
    }

    // Auto-create Client if it doesn't exist for this user
    if (data.client && typeof data.client === 'string') {
      const clientName = data.client.trim();
      const clientExists = await Client.findOne({ user: userId, name: clientName });
      if (!clientExists) {
        await Client.create({
          user: userId,
          name: clientName,
        });
      }
    }

    // Auto-create Category if it doesn't exist for this user
    if (data.category && typeof data.category === 'string') {
      const categoryName = data.category.trim();
      const categoryExists = await Category.findOne({ user: userId, name: categoryName });
      if (!categoryExists) {
        await Category.create({
          user: userId,
          name: categoryName,
        });
      }
    }

    const reminder = await Reminder.create(reminderData);
    return reminder;
  }

  /**
   * Get all reminders for a user with filtering, searching, and status auto-update
   */
  async getAllReminders(userId: string, filters: any = {}): Promise<{ reminders: IReminder[]; total: number }> {
    const { status, category, client, search, page = 1, limit = 50 } = filters;

    // First auto-mark overdue reminders
    await Reminder.updateMany(
      {
        user: userId,
        status: 'Pending',
        dueDate: { $lt: new Date() },
      },
      {
        $set: { status: 'Overdue' },
      }
    );

    const query: any = { user: userId };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    if (client) {
      query.client = { $regex: client, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { client: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [reminders, total] = await Promise.all([
      Reminder.find(query).sort({ dueDate: 1, createdAt: -1 }).skip(skip).limit(Number(limit)),
      Reminder.countDocuments(query),
    ]);

    return { reminders, total };
  }

  /**
   * Get a single reminder by ID
   */
  async getReminderById(userId: string, reminderId: string): Promise<IReminder> {
    const reminder = await Reminder.findOne({ _id: reminderId, user: userId });
    if (!reminder) {
      throw new Error('Reminder not found');
    }
    return reminder;
  }

  /**
   * Update a reminder by ID with auto-repeat logic on completion
   */
  async updateReminder(userId: string, reminderId: string, updateData: any): Promise<IReminder> {
    const existingReminder = await Reminder.findOne({ _id: reminderId, user: userId });
    if (!existingReminder) {
      throw new Error('Reminder not found or unauthorized');
    }

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const updatedReminder = await Reminder.findOneAndUpdate(
      { _id: reminderId, user: userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedReminder) {
      throw new Error('Reminder not found or unauthorized');
    }

    // Auto-repeat logic: When marking a repeating reminder as Completed
    if (updateData.status === 'Completed' && updatedReminder.repeat) {
      const nextDates = this.calculateNextDates(updatedReminder);
      const nextCycle = this.incrementCycle(updatedReminder.cycle);

      await Reminder.create({
        user: userId,
        title: updatedReminder.title,
        description: updatedReminder.description,
        client: updatedReminder.client,
        category: updatedReminder.category,
        cycle: nextCycle,
        status: 'Pending',
        dueDate: nextDates.dueDate,
        startDate: nextDates.startDate,
        endDate: nextDates.endDate,
        schedule: updatedReminder.schedule,
        repeat: true,
        notifyEmail: updatedReminder.notifyEmail,
        notifyDashboard: updatedReminder.notifyDashboard,
      });
    }

    return updatedReminder;
  }

  /**
   * Delete a reminder by ID
   */
  async deleteReminder(userId: string, reminderId: string): Promise<boolean> {
    const result = await Reminder.deleteOne({ _id: reminderId, user: userId });
    if (result.deletedCount === 0) {
      throw new Error('Reminder not found or unauthorized');
    }
    return true;
  }
}

export default new ReminderService();
