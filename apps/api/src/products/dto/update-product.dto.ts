import { z } from 'zod';

// Create base product schema without refinements for update operations
const BaseProductSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(100),
  slug: z.string().min(1, 'Slug is required'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000)
    .optional(),
  price: z
    .number()
    .positive('Price must be positive')
    .max(999999.99, 'Price exceeds maximum allowed'),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  images: z
    .array(
      z.object({
        url: z.string().url('Invalid image URL'),
        altText: z.string().optional(),
        isDefault: z.boolean().default(false),
      }),
    )
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed')
    .optional(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, 'Variant name is required'),
        slug: z.string().min(1, 'Variant slug is required'),
        sku: z.string().min(1, 'SKU is required'),
        price: z.number().positive('Variant price must be positive'),
        stockQuantity: z
          .number()
          .int()
          .min(0, 'Stock quantity cannot be negative'),
        attributes: z
          .array(
            z.object({
              attributeId: z.string(),
              value: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .min(1, 'At least one variant is required'),
  metaTitle: z.string().max(60, 'Meta title too long').optional(),
  metaDescription: z.string().max(160, 'Meta description too long').optional(),
});

// For update operations, make all fields optional since only some fields may be updated
export const UpdateProductSchema = BaseProductSchema.partial();

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
