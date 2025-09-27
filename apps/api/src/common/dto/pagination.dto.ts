// src/common/dto/pagination.dto.ts

import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { z } from 'zod';

// --- Zod Schema for Validation ---
export const PaginationSchema = z.object({
  // Use z.coerce.number() because query parameters are strings by default.
  // This will safely convert "10" to 10.
  page: z.coerce
    .number({ invalid_type_error: 'Page must be a number' })
    .int({ message: 'Page must be an integer' })
    .positive({ message: 'Page must be a positive number' })
    .default(1), // Provide a sensible default if the client doesn't.

  limit: z.coerce
    .number({ invalid_type_error: 'Limit must be a number' })
    .int({ message: 'Limit must be an integer' })
    .positive({ message: 'Limit must be a positive number' })
    .max(100, { message: 'Limit cannot be greater than 100' }) // Security: prevent users from requesting huge datasets.
    .default(10), // A common and reasonable default limit.
});

export class PaginationDto {
  @IsOptional()
  @Type(() => Number) // Transform incoming query param (string) to a number
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // It's good practice to set a max limit
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
