import { z } from 'zod';

export const CreateDiscountSchema = z.object({
  code: z.string()
    .min(3, 'Discount code must be at least 3 characters')
    .max(50, 'Discount code too long')
    .regex(/^[A-Z0-9_-]+$/, 'Discount code must contain only uppercase letters, numbers, hyphens, and underscores'),
  type: z.enum(['PERCENT', 'AMOUNT'], {
    errorMap: () => ({ message: 'Discount type must be PERCENT or AMOUNT' }),
  }),
  value: z.number()
    .positive('Discount value must be positive')
    .max(10000, 'Discount value too high'),
  startsAt: z.string().datetime('Invalid start date format').optional(),
  endsAt: z.string().datetime('Invalid end date format').optional(),
  minPurchaseAmount: z.number().nonnegative('Minimum purchase amount cannot be negative').optional(),
  maxUsageCount: z.number().int().positive('Max usage count must be positive').optional(),
  active: z.boolean().default(true),
}).refine((data) => {
  // Business rule: PERCENT discounts should not exceed 100%
  if (data.type === 'PERCENT' && data.value > 100) {
    return false;
  }
  return true;
}, {
  message: 'Percentage discount cannot exceed 100%',
  path: ['value'],
}).refine((data) => {
  // Business rule: End date must be after start date
  if (data.startsAt && data.endsAt && new Date(data.endsAt) <= new Date(data.startsAt)) {
    return false;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endsAt'],
});

export const DiscountSchema = z.object({
  id: z.string(),
  code: z.string(),
  type: z.enum(['PERCENT', 'AMOUNT']),
  value: z.number(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  minPurchaseAmount: z.number().optional(),
  maxUsageCount: z.number().optional(),
  currentUsageCount: z.number().optional(),
  active: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

// Export inferred types - SCHEMA-FIRST APPROACH
export type CreateDiscountDto = z.infer<typeof CreateDiscountSchema>;
export type DiscountDto = z.infer<typeof DiscountSchema>;
