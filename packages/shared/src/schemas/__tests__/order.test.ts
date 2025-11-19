import { describe, it, expect } from 'vitest';
import { OrderSchema, OrderItemSchema } from '../order';

describe('OrderItemSchema', () => {
  it('validates valid order item', () => {
    const validData = {
      productId: 'prod-123',
      productName: 'Test Product',
      variantId: 'var-456',
      sku: 'SKU-001',
      quantity: 2,
      price: 29.99,
    };
    const result = OrderItemSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates item with minimal fields', () => {
    const validData = {
      productId: 'prod-123',
      quantity: 1,
      price: 10.0,
    };
    const result = OrderItemSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects non-integer quantity', () => {
    const invalidData = {
      productId: 'prod-123',
      quantity: 1.5,
      price: 10.0,
    };
    const result = OrderItemSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('OrderSchema', () => {
  it('validates valid order data', () => {
    const validData = {
      id: 'order-123',
      userId: 'user-456',
      items: [
        {
          productId: 'prod-789',
          quantity: 2,
          price: 29.99,
        },
      ],
      subtotal: 59.98,
      total: 59.98,
      status: 'PENDING',
      paymentStatus: 'UNPAID',
    };
    const result = OrderSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates order with shipping address', () => {
    const validData = {
      items: [
        {
          productId: 'prod-789',
          quantity: 1,
          price: 10.0,
        },
      ],
      shippingAddress: {
        fullName: 'John Doe',
        street: '123 Main St',
        city: 'Springfield',
        state: 'IL',
        postalCode: '62701',
        country: 'USA',
      },
    };
    const result = OrderSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('validates minimal order', () => {
    const validData = {
      items: [
        {
          productId: 'prod-1',
          quantity: 1,
          price: 5.0,
        },
      ],
    };
    const result = OrderSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects order with empty items array', () => {
    const invalidData = {
      items: [],
    };
    const result = OrderSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
