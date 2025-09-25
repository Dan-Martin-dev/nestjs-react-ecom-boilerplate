import { z } from 'zod';
import { PaymentMethod } from '@repo/db';

export const ProcessPaymentSchema = z.object({
  paymentMethod: z.nativeEnum(PaymentMethod),
  amount: z.number().positive('Payment amount must be positive'),
  installments: z.number().int().positive().optional(),
  cardNumber: z.string().optional(),
  cardHolder: z.string().optional(),
  cardExpiryMonth: z.string().optional(),
  cardExpiryYear: z.string().optional(),
  cardCvv: z.string().optional(),
  paymentProviderToken: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type ProcessPaymentDto = z.infer<typeof ProcessPaymentSchema>;
