import { User } from './user';

// Auth response type (API response shape)
export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
}

// DTOs now come from schemas/auth.ts (schema-first approach)
// LoginDto, RegisterDto, JwtPayload are exported from schemas
