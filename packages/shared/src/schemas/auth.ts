import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password too long'),
});

export const RegisterSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email too long'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long')
    .optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(100, 'Password too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: 'New password must be different from current password',
  path: ['newPassword'],
});

export const JwtPayloadSchema = z.object({
  sub: z.string(), // Can be UUID or any string ID
  email: z.string().email().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN'], {
    errorMap: () => ({ message: 'Invalid user role' }),
  }).optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

// Export inferred types - SCHEMA-FIRST APPROACH
export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>;
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
