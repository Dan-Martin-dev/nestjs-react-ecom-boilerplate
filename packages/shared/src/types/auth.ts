import { User } from './user';

// JWT Payload interface
export interface JwtPayload {
  sub: number;
  email: string;
  role?: string;
}

// Auth types and interfaces
export interface RegisterDto {
  email: string;
  password: string;
  name?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token?: string;
}
