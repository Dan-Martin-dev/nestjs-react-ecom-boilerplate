import { z } from 'zod';

export const AddressSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  type: z.enum(['SHIPPING', 'BILLING']).optional(),
  isDefault: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type AddressDto = z.infer<typeof AddressSchema>;
