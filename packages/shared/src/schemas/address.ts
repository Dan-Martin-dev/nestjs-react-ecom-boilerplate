import { z } from 'zod';

export const CreateAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name too long'),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  street: z.string().min(3, 'Street address must be at least 3 characters').max(200, 'Street address too long'),
  city: z.string().min(2, 'City must be at least 2 characters').max(100, 'City name too long'),
  state: z.string().min(2, 'State must be at least 2 characters').max(100, 'State name too long'),
  postalCode: z.string().min(3, 'Postal code must be at least 3 characters').max(20, 'Postal code too long'),
  country: z.string().min(2, 'Country must be at least 2 characters').max(100, 'Country name too long'),
  type: z.enum(['SHIPPING', 'BILLING'], {
    errorMap: () => ({ message: 'Address type must be SHIPPING or BILLING' }),
  }),
  isDefault: z.boolean().default(false),
});

export const AddressSchema = z.object({
  id: z.string(),
  userId: z.string(),
  fullName: z.string(),
  phone: z.string().optional(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  type: z.enum(['SHIPPING', 'BILLING']),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Export inferred types - SCHEMA-FIRST APPROACH
export type CreateAddressDto = z.infer<typeof CreateAddressSchema>;
export type AddressDto = z.infer<typeof AddressSchema>;
