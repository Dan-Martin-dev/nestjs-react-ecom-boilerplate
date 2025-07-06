import { z } from 'zod';
import { CreateAddressSchema } from './create-address.dto';

// The update schema allows any subset of the create schema fields to be updated.
export const UpdateAddressSchema = CreateAddressSchema.partial();

// Create a TypeScript type from the Zod schema
export type UpdateAddressDto = z.infer<typeof UpdateAddressSchema>;