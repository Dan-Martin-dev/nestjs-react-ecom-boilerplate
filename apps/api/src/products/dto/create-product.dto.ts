import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  images: z
    .array(
      z.object({
        url: z.string().url('Invalid image URL'),
        altText: z.string().optional(),
        isDefault: z.boolean().default(false),
      }),
    )
    .optional(),
  variants: z
    .array(
      z.object({
        name: z.string().min(1, 'Variant name is required'),
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
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;
