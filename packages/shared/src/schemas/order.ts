import { z } from 'zod';

export const OrderItemSchema = z.object({
  productId: z.string(),
  productName: z.string().optional(),
  variantId: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.number().int(),
  price: z.number(),
});

export const OrderSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  items: z.array(OrderItemSchema),
  subtotal: z.number().optional(),
  total: z.number().optional(),
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  shippingAddress: z.object({
    fullName: z.string().optional(),
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type OrderDto = z.infer<typeof OrderSchema>;
