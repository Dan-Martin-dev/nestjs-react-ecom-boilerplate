import { describe, it, expect } from 'vitest';
import { LoginSchema, RegisterSchema, JwtPayloadSchema } from '../auth';

describe('LoginSchema', () => {
  it('validates valid login data', () => {
    const validData = {
      email: 'user@example.com',
      password: 'password123',
    };
    const result = LoginSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const invalidData = {
      email: 'not-an-email',
      password: 'password123',
    };
    const result = LoginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects short password', () => {
    const invalidData = {
      email: 'user@example.com',
      password: '12345',
    };
    const result = LoginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password');
    }
  });

  it('rejects missing fields', () => {
    const invalidData = { email: 'user@example.com' };
    const result = LoginSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('RegisterSchema', () => {
  it('validates valid registration data', () => {
    const validData = {
      email: 'newuser@example.com',
      password: 'securePass123',
      name: 'John Doe',
    };
    const result = RegisterSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates registration without optional name', () => {
    const validData = {
      email: 'newuser@example.com',
      password: 'securePass123',
    };
    const result = RegisterSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email format', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
    };
    const result = RegisterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects weak password', () => {
    const invalidData = {
      email: 'user@example.com',
      password: 'weak',
    };
    const result = RegisterSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('JwtPayloadSchema', () => {
  it('validates valid JWT payload with all fields', () => {
    const validData = {
      sub: 'user-123',
      email: 'user@example.com',
      role: 'CUSTOMER',
    };
    const result = JwtPayloadSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates JWT payload with only sub', () => {
    const validData = {
      sub: 'user-123',
    };
    const result = JwtPayloadSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates ADMIN role', () => {
    const validData = {
      sub: 'admin-456',
      email: 'admin@example.com',
      role: 'ADMIN',
    };
    const result = JwtPayloadSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid role', () => {
    const invalidData = {
      sub: 'user-123',
      role: 'INVALID_ROLE',
    };
    const result = JwtPayloadSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
