import { z } from 'zod';

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    type: z.enum(['house', 'apartment', 'room', 'hostel', 'office', 'commercial']),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.number().positive('Price must be greater than 0'),
    district: z.string().min(2, 'District is required'),
    city: z.string().min(2, 'City is required'),
    area: z.string().min(2, 'Area is required'),
    address: z.string().min(3, 'Address is required'),
    bedrooms: z.number().int().nonnegative().optional().default(0),
    bathrooms: z.number().int().nonnegative().optional().default(0),
    size: z.number().int().nonnegative().optional().default(0),
    furnishing: z.string().optional().default('Unfurnished'),
    availableFrom: z.string().optional().default(''),
    amenities: z.array(z.string()).optional().default([]),
    images: z.array(z.string().url()).optional().default([]),
    status: z.enum(['draft', 'pending']).optional().default('pending'),
  }),
});

export const updatePropertySchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    type: z.enum(['house', 'apartment', 'room', 'hostel', 'office', 'commercial']).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    district: z.string().min(2).optional(),
    city: z.string().min(2).optional(),
    area: z.string().min(2).optional(),
    address: z.string().min(3).optional(),
    bedrooms: z.number().int().nonnegative().optional(),
    bathrooms: z.number().int().nonnegative().optional(),
    size: z.number().int().nonnegative().optional(),
    furnishing: z.string().optional(),
    availableFrom: z.string().optional(),
    amenities: z.array(z.string()).optional(),
    images: z.array(z.string().url()).optional(),
    status: z.enum(['draft', 'pending', 'approved', 'suspended', 'rejected']).optional(),
  }),
});
