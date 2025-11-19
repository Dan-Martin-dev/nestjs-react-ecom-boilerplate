import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN']).optional(),
  isEmailVerified: z.boolean().optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const CreateUserSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .optional(),
  role: z.enum(['CUSTOMER', 'ADMIN']).default('CUSTOMER'),
});

export const UpdateUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// Export inferred types - SCHEMA-FIRST APPROACH
export type UserDto = z.infer<typeof UserSchema>;
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;
