import { z } from 'zod';

export const createClientSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Client name is required'),
    contact: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
  }),
});

export const updateClientSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).optional(),
    contact: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
    phone: z.string().optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
  }),
});
