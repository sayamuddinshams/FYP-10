import { z } from 'zod';

export const createVisitSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1, 'Property ID is required'),
    date: z.string().min(4, 'Date is required'),
    time: z.string().min(2, 'Time is required'),
    message: z.string().optional().default(''),
  }),
});

export const updateVisitStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'approved', 'rejected', 'rescheduled', 'completed']),
    ownerNote: z.string().optional(),
    date: z.string().optional(),
    time: z.string().optional(),
  }),
});
