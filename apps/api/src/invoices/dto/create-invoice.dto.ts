import { z } from 'zod';
import { InvoiceType } from '@repo/db';

export const CreateInvoiceSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  pointOfSale: z.number().int().positive('Point of sale must be a positive number'),
  type: z.nativeEnum(InvoiceType),
  cae: z.string().optional(),
  caeExpirationDate: z.string().optional(),
  issueDate: z.string().transform(val => new Date(val)),
  netAmount: z.string().min(1, 'Net amount is required'),
  taxAmount: z.string().min(1, 'Tax amount is required'),
  totalAmount: z.string().min(1, 'Total amount is required'),
  taxBreakdown: z.array(
    z.object({
      rate: z.number(),
      base: z.string(),
      amount: z.string(),
      description: z.string().optional(),
    })
  ).optional(),
  recipientTaxId: z.string().optional(),
  recipientName: z.string().optional(),
  recipientType: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateInvoiceDto = z.infer<typeof CreateInvoiceSchema>;
