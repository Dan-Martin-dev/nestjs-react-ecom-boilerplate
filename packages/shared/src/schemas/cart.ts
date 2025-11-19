import { z } from 'zod';

export const CartItemSchema = z.object({
  id: z.string().optional(),
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid('Invalid variant ID').optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity exceeds maximum allowed'),
  price: z.number().positive('Price must be positive').optional(),
});

export const AddToCartSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid('Invalid variant ID').optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Cannot add more than 100 items at once'),
});

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(100, 'Quantity exceeds maximum'),
}).refine((data) => data.quantity >= 1, {
  message: 'Quantity must be at least 1 (use delete endpoint to remove items)',
  path: ['quantity'],
});

export const CartSchema = z.object({
  id: z.string(),
  userId: z.string(),
  items: z.array(CartItemSchema),
  total: z.number().nonnegative('Total cannot be negative'),
  createdAt: z.string(),
  updatedAt: z.string(),
});

// Export inferred types - SCHEMA-FIRST APPROACH
export type CartItemDto = z.infer<typeof CartItemSchema>;
export type AddToCartDto = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemDto = z.infer<typeof UpdateCartItemSchema>;
export type CartDto = z.infer<typeof CartSchema>;
