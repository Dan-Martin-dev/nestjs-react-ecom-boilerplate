import { z } from 'zod';

// Category Schema using Zod
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(100),
  description: z.string().max(500, 'Description too long').optional(),
  parentId: z.string().uuid('Invalid parent category ID').optional(),
});

// Create a schema for category response DTOs
export const CategoryDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  parentId: z.string().optional(),
  _count: z.object({
    Product: z.number()
  }).optional()
});

// Export the inferred types - SCHEMA-FIRST APPROACH
export type CategorySchema = z.infer<typeof CreateCategorySchema>;
export type CategoryDto = z.infer<typeof CategoryDtoSchema>;
