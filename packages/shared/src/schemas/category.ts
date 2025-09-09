import { z } from 'zod';
import type { CreateCategoryDto } from '../types/category';

// Category Schema using Zod
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

// Export the type that is inferred from the schema
export type CategorySchema = z.infer<typeof CreateCategorySchema>;

// Type assertion to ensure compatibility with shared types
const _typeCheck: CreateCategoryDto = {} as unknown as CategorySchema;

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

export type CategoryDto = z.infer<typeof CategoryDtoSchema>;
