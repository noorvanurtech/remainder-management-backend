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

    if (schedule === 'Daily') {
      nextDue.setDate(nextDue.getDate() + 1);
    } else if (schedule === 'Monthly') {
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
    } else if (schedule === 'One-time') {
      nextDue = new Date(currentDue);
    } else {
      nextDue.setMonth(nextDue.getMonth() + 1);
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
    const { status, category, client, search, page = 1, limit = 50, sort } = filters;

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

    // Default sort by createdAt descending (initial order) so updating status or due date does not change response order
    const sortOption: any = sort ? sort : { createdAt: -1 };

    const [reminders, total] = await Promise.all([
      Reminder.find(query).sort(sortOption).skip(skip).limit(Number(limit)),
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
   * Helper to check if a reminder is eligible to advance to the next cycle
   */
  private validateCycleAdvanceEligibility(reminder: IReminder): void {
    const now = new Date();
    const due = new Date(reminder.dueDate);
    const schedule = reminder.schedule || 'Monthly';

    if (schedule === 'Daily') {
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfDueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
      if (startOfDueDay >= startOfToday) {
        throw new Error('Cannot update daily reminder: due date is today or in the future');
      }
    } else if (schedule === 'Monthly' || schedule === '3 Months' || schedule === '6 Months') {
      const currentYearMonth = now.getFullYear() * 12 + now.getMonth();
      const dueYearMonth = due.getFullYear() * 12 + due.getMonth();
      if (dueYearMonth >= currentYearMonth) {
        throw new Error('Cannot update monthly reminder: due date is within the current month or in the future');
      }
    } else if (schedule === 'Yearly') {
      const currentYear = now.getFullYear();
      const dueYear = due.getFullYear();
      if (dueYear >= currentYear) {
        throw new Error('Cannot update yearly reminder: due date is within the current year or in the future');
      }
    } else {
      if (due >= now) {
        throw new Error('Cannot update reminder: due date has not passed yet');
      }
    }
  }

  /**
   * Update a reminder by ID with auto-repeat logic on completion
   */
  async updateReminder(userId: string, reminderId: string, updateData: any): Promise<IReminder> {
    const existingReminder = await Reminder.findOne({ _id: reminderId, user: userId });
    if (!existingReminder) {
      throw new Error('Reminder not found or unauthorized');
    }

    // Protect createdAt so it remains unchanged from when the reminder was created
    delete updateData.createdAt;

    // Check if advancing to the next cycle (when dueDate is not explicitly provided, or status is Completed)
    const isAdvancingCycle = !updateData.dueDate || updateData.status === 'Completed';
    if (isAdvancingCycle) {
      this.validateCycleAdvanceEligibility(existingReminder);
    }

    // If dueDate is not sent, calculate next due date based on schedule nature (Daily, Monthly, 3 Months, 6 Months, Yearly, etc.)
    if (!updateData.dueDate) {
      const nextDates = this.calculateNextDates(existingReminder);
      updateData.dueDate = nextDates.dueDate;
      if (nextDates.endDate) {
        updateData.endDate = nextDates.endDate;
      }
      if (existingReminder.cycle) {
        updateData.cycle = this.incrementCycle(existingReminder.cycle);
      }
    } else {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    // Ignore status 'Completed' if sent and reset status to 'Pending' so the reminder stays active for the next due date
    if (updateData.status === 'Completed') {
      updateData.status = 'Pending';
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
