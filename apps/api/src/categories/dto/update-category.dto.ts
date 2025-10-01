import { z } from 'zod';

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export type UpdateCategoryDto = z.infer<typeof UpdateCategorySchema>;
