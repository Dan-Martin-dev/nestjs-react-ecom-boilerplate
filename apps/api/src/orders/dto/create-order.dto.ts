import { z } from 'zod';
import { PaymentMethod } from '@repo/db';

export const CreateOrderSchema = z.object({
  shippingAddressId: z.string().min(1, 'Shipping address is required'),
  billingAddressId: z.string().min(1, 'Billing address is required'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
  currency: z.string().default('ARS').optional(), // Default currency for Argentina
  installments: z.number().int().positive().optional(), // For payment methods that support installments
  installmentPlan: z.string().optional(), // Description of the installment plan
});

export type CreateOrderDto = z.infer<typeof CreateOrderSchema>;
