// monorepo-ecom/backend/src/auth/dto/register.dto.ts
import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required').optional(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
