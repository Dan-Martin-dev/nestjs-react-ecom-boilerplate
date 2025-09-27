import { z } from 'zod';
// Import the base schema, NOT the create schema
import { DiscountBaseSchema } from './create-discount.dto';

// 1. Create a partial version of the base schema. All fields are now optional.
const PartialDiscountSchema = DiscountBaseSchema.partial();

// 2. Apply the same refinements to the partial schema to ensure consistency.
export const UpdateDiscountSchema = PartialDiscountSchema.refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.endDate > data.startDate;
    }
    return true;
  },
  {
    message: 'End date must be after start date',
    path: ['endDate'],
  },
).refine(
  (data) => {
    if (data.type === 'PERCENTAGE' && data.value !== undefined) {
      return data.value > 0 && data.value <= 100;
    }
    return true;
  },
  {
    message: 'Percentage value must be between 1 and 100',
    path: ['value'],
  },
);

export type UpdateDiscountDto = z.infer<typeof UpdateDiscountSchema>;
