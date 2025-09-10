import { z } from 'zod';

export const CartItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1),
  price: z.number().optional(),
});

export const CartSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  items: z.array(CartItemSchema).optional(),
  total: z.number().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type CartDto = z.infer<typeof CartSchema>;
