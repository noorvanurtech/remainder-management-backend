import { z } from 'zod';

export const createReminderSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Reminder title is required'),
    description: z.string().optional(),
    client: z.string().trim().min(1, 'Client name is required'),
    category: z.string().trim().min(1, 'Category is required'),
    cycle: z.string().optional(),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid due date format. Must be a valid date string.',
    }),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid start date format.',
    }).optional(),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid end date format.',
    }).optional(),
    schedule: z.enum(['Daily', 'Monthly', '3 Months', '6 Months', 'Yearly', 'Custom Date', 'One-time']).optional(),
    repeat: z.boolean().optional(),
    notifyEmail: z.boolean().optional(),
    notifyDashboard: z.boolean().optional(),
  }),
});

export const updateReminderSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    client: z.string().trim().min(1).optional(),
    category: z.string().trim().min(1).optional(),
    cycle: z.string().optional(),
    status: z.enum(['Pending', 'Overdue', 'Completed', 'Cancelled']).optional(),
    dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid due date format',
    }).optional(),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid start date format',
    }).optional(),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid end date format',
    }).optional(),
    schedule: z.enum(['Daily', 'Monthly', '3 Months', '6 Months', 'Yearly', 'Custom Date', 'One-time']).optional(),
    repeat: z.boolean().optional(),
    notifyEmail: z.boolean().optional(),
    notifyDashboard: z.boolean().optional(),
  }),
});
