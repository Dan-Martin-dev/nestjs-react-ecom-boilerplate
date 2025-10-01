import { z } from 'zod';

export const UpdateReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1)
    .max(5)
    .optional()
    .describe('Rating from 1 to 5'),
  comment: z
    .string()
    .min(3)
    .max(500)
    .optional()
    .describe('User comment on the product'),
});

export type UpdateReviewDto = z.infer<typeof UpdateReviewSchema>;
