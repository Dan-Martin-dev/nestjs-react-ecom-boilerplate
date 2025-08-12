// Type integration utility for API
import * as SharedTypes from '@repo/shared';
import { z } from 'zod';

// We'll create validation schemas that match our shared types
// This allows us to validate incoming data according to our shared type definitions

// The pattern is to define a schema, then extract the type and assert compatibility with shared types
export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    altText: z.string().optional(),
    isDefault: z.boolean().default(false),
  })).optional(),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    sku: z.string().min(1, 'SKU is required'),
    price: z.number().positive('Variant price must be positive'),
    stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
    attributes: z.array(z.object({
      attributeId: z.string(),
      value: z.string(),
    })).optional(),
  })).min(1, 'At least one variant is required'),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

// Extract type and assert compatibility
export type CreateProductDto = z.infer<typeof CreateProductSchema>;
// This is a compile-time check to ensure our schema matches the shared type
// It will error if the schemas don't match the shared types
const _typeCheck: SharedTypes.CreateProductDto = {} as CreateProductDto;

// Similar pattern for other DTOs
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export type CreateCategoryDto = z.infer<typeof CreateCategorySchema>;
const _categoryTypeCheck: SharedTypes.CreateCategoryDto = {} as CreateCategoryDto;
