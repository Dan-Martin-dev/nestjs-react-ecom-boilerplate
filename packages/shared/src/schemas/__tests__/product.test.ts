import { describe, it, expect } from 'vitest';
import { CreateProductSchema, ProductDtoSchema } from '../product';

describe('CreateProductSchema', () => {
  it('validates valid product data', () => {
    const validData = {
      name: 'Test Product',
      slug: 'test-product',
      description: 'A great product',
      price: 29.99,
      categoryIds: ['cat-123'],
      variants: [
        {
          name: 'Default',
          slug: 'default',
          sku: 'SKU-001',
          price: 29.99,
          stockQuantity: 100,
        },
      ],
    };
    const result = CreateProductSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects product with empty name', () => {
    const invalidData = {
      name: '',
      slug: 'test',
      price: 10,
      categoryIds: ['cat-1'],
      variants: [{ name: 'V1', slug: 's1', sku: 'SKU', price: 10, stockQuantity: 1 }],
    };
    const result = CreateProductSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('required');
    }
  });

  it('rejects negative price', () => {
    const invalidData = {
      name: 'Product',
      slug: 'product',
      price: -10,
      categoryIds: ['cat-1'],
      variants: [{ name: 'V1', slug: 's1', sku: 'SKU', price: 10, stockQuantity: 1 }],
    };
    const result = CreateProductSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('positive');
    }
  });

  it('rejects product without categories', () => {
    const invalidData = {
      name: 'Product',
      slug: 'product',
      price: 10,
      categoryIds: [],
      variants: [{ name: 'V1', slug: 's1', sku: 'SKU', price: 10, stockQuantity: 1 }],
    };
    const result = CreateProductSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('At least one category');
    }
  });

  it('rejects product without variants', () => {
    const invalidData = {
      name: 'Product',
      slug: 'product',
      price: 10,
      categoryIds: ['cat-1'],
      variants: [],
    };
    const result = CreateProductSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('At least one variant');
    }
  });

  it('validates product with optional images', () => {
    const validData = {
      name: 'Product',
      slug: 'product',
      price: 10,
      categoryIds: ['cat-1'],
      variants: [{ name: 'V1', slug: 's1', sku: 'SKU', price: 10, stockQuantity: 1 }],
      images: [
        { url: 'https://example.com/image.jpg', isDefault: true },
      ],
    };
    const result = CreateProductSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects invalid image URL', () => {
    const invalidData = {
      name: 'Product',
      slug: 'product',
      price: 10,
      categoryIds: ['cat-1'],
      variants: [{ name: 'V1', slug: 's1', sku: 'SKU', price: 10, stockQuantity: 1 }],
      images: [
        { url: 'not-a-url', isDefault: true },
      ],
    };
    const result = CreateProductSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Invalid');
    }
  });
});

describe('ProductDtoSchema', () => {
  it('validates valid product DTO', () => {
    const validData = {
      id: 'prod-123',
      name: 'Test Product',
      slug: 'test-product',
      price: '29.99',
      isActive: true,
      images: [],
    };
    const result = ProductDtoSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates DTO with optional fields', () => {
    const validData = {
      id: 'prod-123',
      name: 'Test Product',
      slug: 'test-product',
      description: 'A description',
      price: '29.99',
      isActive: true,
      metaTitle: 'Meta Title',
      metaDescription: 'Meta Desc',
      images: [],
      variants: [
        { id: 'var-1', name: 'V1', sku: 'SKU', price: '29.99', stockQuantity: 10 },
      ],
      _count: { reviews: 5 },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    };
    const result = ProductDtoSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});
