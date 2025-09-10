import { z } from 'zod';

export const PaginationSchema = z.object({
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).optional(),
});

export const IdListSchema = z.array(z.string());

export type Pagination = z.infer<typeof PaginationSchema>;
