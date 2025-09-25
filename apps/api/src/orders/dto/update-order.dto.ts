import { z } from 'zod';
import { CreateOrderSchema } from './create-order.dto';

// The update schema allows any subset of the create schema fields to be updated.
export const UpdateOrderSchema = CreateOrderSchema.partial();

// Create a TypeScript type from the Zod schema
export type UpdateOrderDto = z.infer<typeof UpdateOrderSchema>;
