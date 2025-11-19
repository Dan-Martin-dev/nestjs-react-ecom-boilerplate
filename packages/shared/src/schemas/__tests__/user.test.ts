import { describe, it, expect } from 'vitest';
import { UserSchema, CreateUserSchema } from '../user';

describe('UserSchema', () => {
  it('validates valid user data', () => {
    const validData = {
      id: 'user-123',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'CUSTOMER',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    };
    const result = UserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates user without optional fields', () => {
    const validData = {
      id: 'user-123',
      email: 'user@example.com',
    };
    const result = UserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const invalidData = {
      id: 'user-123',
      email: 'not-an-email',
    };
    const result = UserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('validates ADMIN role', () => {
    const validData = {
      id: 'admin-456',
      email: 'admin@example.com',
      role: 'ADMIN',
    };
    const result = UserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('CreateUserSchema', () => {
  it('validates valid user creation data', () => {
    const validData = {
      email: 'newuser@example.com',
      password: 'securePassword123',
      name: 'Jane Doe',
    };
    const result = CreateUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates without optional name', () => {
    const validData = {
      email: 'newuser@example.com',
      password: 'securePassword123',
    };
    const result = CreateUserSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects short password', () => {
    const invalidData = {
      email: 'user@example.com',
      password: '12345',
    };
    const result = CreateUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const invalidData = {
      email: 'invalid',
      password: 'password123',
    };
    const result = CreateUserSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
