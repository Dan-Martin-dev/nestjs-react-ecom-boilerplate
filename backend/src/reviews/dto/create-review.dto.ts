import { z } from 'zod';

export const CreateReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().optional(),
});

export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;