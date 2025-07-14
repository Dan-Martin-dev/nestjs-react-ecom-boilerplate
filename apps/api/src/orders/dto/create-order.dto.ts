import { z } from 'zod';
import { PaymentMethod } from '@repo/db';

export const CreateOrderSchema = z.object({
  shippingAddressId: z.string().min(1, 'Shipping address is required'),
  billingAddressId: z.string().min(1, 'Billing address is required'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;