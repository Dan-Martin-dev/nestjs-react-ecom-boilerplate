import { z } from 'zod';

export const ReviewSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  productId: z.string().optional(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().optional(),
  createdAt: z.string().optional(),
});

export type ReviewDto = z.infer<typeof ReviewSchema>;
