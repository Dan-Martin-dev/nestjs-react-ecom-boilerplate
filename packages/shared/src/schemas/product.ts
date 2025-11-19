import { z } from 'zod';

export const ProductImageSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  altText: z.string().optional(),
  isDefault: z.boolean(),
});

// Schema for creating products
export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000).optional(),
  price: z.number().positive('Price must be positive').max(999999.99, 'Price exceeds maximum allowed'),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    altText: z.string().optional(),
    isDefault: z.boolean().default(false),
  })).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed').optional(),
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
  metaTitle: z.string().max(60, 'Meta title too long').optional(),
  metaDescription: z.string().max(160, 'Meta description too long').optional(),
}).refine((data) => {
  // Business rule: Premium products (>$100) require detailed descriptions
  if (data.price > 100 && data.description) {
    return data.description.length >= 50;
  }
  return true;
}, {
  message: 'Premium products (>$100) require detailed descriptions (50+ characters)',
  path: ['description'],
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

// Export the inferred types - SCHEMA-FIRST APPROACH
export type ProductSchema = z.infer<typeof CreateProductSchema>;
export type ProductDto = z.infer<typeof ProductDtoSchema>;
export type ProductImage = z.infer<typeof ProductImageSchema>;
