import { z } from 'zod';

export const CreateReviewSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title too long').optional(),
  body: z.string().min(10, 'Review must be at least 10 characters').max(2000, 'Review too long').optional(),
}).refine((data) => {
  // Business rule: Low ratings (1-2 stars) should have a review body
  if (data.rating <= 2 && !data.body) {
    return false;
  }
  return true;
}, {
  message: 'Low ratings require a review explanation',
  path: ['body'],
});

export const ReviewSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

// Export inferred types - SCHEMA-FIRST APPROACH
export type CreateReviewDto = z.infer<typeof CreateReviewSchema>;
export type ReviewDto = z.infer<typeof ReviewSchema>;
