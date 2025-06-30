import { z } from 'zod';

export const AddToCartSchema = z.object({
  productVariantId: z.string().min(1, 'Product variant ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export type AddToCartDto = z.infer<typeof AddToCartSchema>;
