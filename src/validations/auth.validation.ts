import { z } from 'zod';

export const registerSchema = z.object({
    body: z.object({
        fullName: z.string().trim().min(1, 'Full name is required').min(2, 'Full name must be at least 2 characters'),
        email: z.string().min(1, 'Email is required').email('Invalid email address'),
        password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
        phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits').optional(),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().min(1, 'Email is required').email('Invalid email address'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const googleLoginSchema = z.object({
    body: z.object({
        idToken: z.string().min(1, 'ID Token is required'),
        role: z.string().optional(),
    }),
});
