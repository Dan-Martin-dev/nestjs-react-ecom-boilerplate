import { z } from 'zod';

export const DiscountSchema = z.object({
  id: z.string().optional(),
  code: z.string(),
  type: z.enum(['PERCENT','AMOUNT']).optional(),
  value: z.number().optional(),
  startsAt: z.string().optional(),
  endsAt: z.string().optional(),
  active: z.boolean().optional(),
});

export type DiscountDto = z.infer<typeof DiscountSchema>;
