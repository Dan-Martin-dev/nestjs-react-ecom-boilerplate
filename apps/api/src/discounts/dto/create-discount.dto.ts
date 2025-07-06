import { z } from 'zod';
import { DiscountType } from '@prisma/client';

// 1. Define the base object shape without refinements. We will export this.
export const DiscountBaseSchema = z.object({  
  code: z
    .string()
    .min(3, 'Code must be at least 3 characters')
    .transform((val) => val.toUpperCase()), // Standardize codes to uppercase
  description: z.string().optional(),
  type: z.nativeEnum(DiscountType),
  value: z.number().positive('Discount value must be positive'),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  isActive: z.boolean().optional().default(true),
  usageLimit: z.number().int().positive().optional(),
  usageLimitPerUser: z.number().int().positive().optional(),
  minimumSpend: z.number().positive().optional(),
  applicableProductIds: z.array(z.string()).optional(),
  applicableCategoryIds: z.array(z.string()).optional(),
});

// 2. Apply the refinements to the base schema to create the final schema for creation.
export const CreateDiscountSchema = DiscountBaseSchema.refine(
  (data) => {
    // Ensure end date is after start date if both are provided
    if (data.startDate && data.endDate) {
      return data.endDate > data.startDate;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'], // Point error to the endDate field
  },
).refine(
  (data) => {
    if (data.type === 'PERCENTAGE') {
      return data.value > 0 && data.value <= 100;
    }
    return true;
  },
  {
    message: 'Percentage value must be between 1 and 100',
    path: ['value'],
  },
);

export type CreateDiscountDto = z.infer<typeof CreateDiscountSchema>;
