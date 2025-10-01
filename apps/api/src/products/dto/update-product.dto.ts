import { z } from 'zod';
import { CreateProductSchema } from '@repo/shared';

// For update operations, make all fields optional since only some fields may be updated
export const UpdateProductSchema = CreateProductSchema.partial();

export type UpdateProductDto = z.infer<typeof UpdateProductSchema>;
