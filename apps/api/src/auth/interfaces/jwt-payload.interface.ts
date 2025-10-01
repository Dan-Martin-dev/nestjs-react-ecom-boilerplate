import { Role } from '@repo/db';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  role: Role;
  iat?: number; // issued at
  exp?: number; // expiration
}
