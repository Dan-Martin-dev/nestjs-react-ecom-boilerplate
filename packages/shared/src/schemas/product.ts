import { z } from 'zod';
import type { CreateProductDto } from '../types/product';

export const ProductImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  altText: z.string().optional(),
  isDefault: z.boolean(),
});

// Schema for creating products
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
    slug: z.string().min(1, 'Variant slug is required'),
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

// Schema for product responses
export const ProductDtoSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional(),
  price: z.string(),
  isActive: z.boolean(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  images: z.array(ProductImageSchema),
  variants: z.array(z.object({
    id: z.string(),
    name: z.string(),
    sku: z.string(),
    price: z.string(),
    stockQuantity: z.number()
  })).optional(),
  _count: z.object({
    reviews: z.number()
  }).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

// Export the inferred types
export type ProductSchema = z.infer<typeof CreateProductSchema>;
export type ProductDto = z.infer<typeof ProductDtoSchema>;

// Type assertion to ensure compatibility with shared types
const _typeCheck: CreateProductDto = {} as unknown as ProductSchema;
