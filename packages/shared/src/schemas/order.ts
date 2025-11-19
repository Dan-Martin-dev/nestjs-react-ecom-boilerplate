import { z } from 'zod';

export const OrderItemSchema = z.object({
  productId: z.string(), // Keep flexible - can be UUID or other ID format
  productName: z.string().optional(),
  variantId: z.string().optional(),
  sku: z.string().optional(),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').max(100, 'Quantity exceeds maximum'),
  price: z.number().positive('Price must be positive'),
});

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  street: z.string().min(3, 'Street address required'),
  city: z.string().min(2, 'City required'),
  state: z.string().min(2, 'State required'),
  postalCode: z.string().min(3, 'Postal code required'),
  country: z.string().min(2, 'Country required'),
  phone: z.string().optional(),
});

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least one item'),
  shippingAddress: ShippingAddressSchema,
  billingAddress: ShippingAddressSchema.optional(),
  discountCode: z.string().optional(),
  notes: z.string().max(500, 'Notes too long').optional(),
});

export const OrderSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least one item'),
  subtotal: z.number().nonnegative('Subtotal cannot be negative').optional(),
  discount: z.number().nonnegative('Discount cannot be negative').optional(),
  tax: z.number().nonnegative('Tax cannot be negative').optional(),
  shippingCost: z.number().nonnegative('Shipping cost cannot be negative').optional(),
  total: z.number().positive('Total must be positive').optional(),
  status: z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  paymentStatus: z.enum(['UNPAID', 'PAID', 'REFUNDED', 'FAILED']).optional(),
  shippingAddress: ShippingAddressSchema.optional(),
  billingAddress: ShippingAddressSchema.optional(),
  trackingNumber: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

// Export inferred types - SCHEMA-FIRST APPROACH
export type OrderItemDto = z.infer<typeof OrderItemSchema>;
export type ShippingAddressDto = z.infer<typeof ShippingAddressSchema>;
export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
export type OrderDto = z.infer<typeof OrderSchema>;
