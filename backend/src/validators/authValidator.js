import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum(['tenant', 'owner']).default('tenant'),
    phone: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    area: z.string().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    district: z.string().optional(),
    city: z.string().optional(),
    area: z.string().optional(),
    address: z.string().optional(),
    bio: z.string().optional(),
    avatar: z.string().nullable().optional(),
    preferredType: z.string().nullable().optional(),
    budgetMax: z.number().nullable().optional(),
    notificationPrefs: z.record(z.any()).optional(),
    appSettings: z.record(z.any()).optional(),
  }),
});
