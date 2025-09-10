import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const JwtPayloadSchema = z.object({
  sub: z.string(),
  email: z.string().email().optional(),
  role: z.enum(['CUSTOMER','ADMIN']).optional(),
});

export type LoginDto = z.infer<typeof LoginSchema>;
export type RegisterDto = z.infer<typeof RegisterSchema>;
export type JwtPayload = z.infer<typeof JwtPayloadSchema>;
