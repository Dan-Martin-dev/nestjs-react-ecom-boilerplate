import { describe, it, expect } from 'vitest';
import { PaginationSchema, IdListSchema } from '../common';

describe('PaginationSchema', () => {
  it('validates valid pagination data', () => {
    const validData = {
      page: 1,
      limit: 10,
    };
    const result = PaginationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates with only page', () => {
    const validData = {
      page: 2,
    };
    const result = PaginationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates with only limit', () => {
    const validData = {
      limit: 20,
    };
    const result = PaginationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates empty object (all optional)', () => {
    const validData = {};
    const result = PaginationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects page less than 1', () => {
    const invalidData = {
      page: 0,
      limit: 10,
    };
    const result = PaginationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects limit less than 1', () => {
    const invalidData = {
      page: 1,
      limit: 0,
    };
    const result = PaginationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects non-integer page', () => {
    const invalidData = {
      page: 1.5,
      limit: 10,
    };
    const result = PaginationSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('IdListSchema', () => {
  it('validates array of string IDs', () => {
    const validData = ['id-1', 'id-2', 'id-3'];
    const result = IdListSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates empty array', () => {
    const validData: string[] = [];
    const result = IdListSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects array with non-string values', () => {
    const invalidData = ['id-1', 123, 'id-3'];
    const result = IdListSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('rejects non-array input', () => {
    const invalidData = 'not-an-array';
    const result = IdListSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
