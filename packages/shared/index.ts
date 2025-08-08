// Shared types and utilities for the ecommerce monorepo

// Export all enums
export * from './types/enums';

// Export all entity types
export * from './types/entities';

// Export all API types
export * from './types/api';

// Export all DTO types
export * from './types/dtos';

// Export validation schemas
export * from './schemas/auth.schemas';

// Explicitly export commonly used types for frontend/backend type sharing
export type { LoginDto, RegisterDto } from './schemas/auth.schemas';
export type {
  ProductFilterDto,
  CreateProductDto,
  CreateCategoryDto,
  AddToCartDto,
  CreateAddressDto,
  CreateOrderDto,
  CreateReviewDto,
  CreateDiscountDto,
  AuthResponse
} from './types/dtos';
export type {
  Category,
  Product,
  Cart,
  CartItem,
  Address,
  Order,
  Review,
  Discount,
  User
} from './types/entities';
export type {
  ApiResponse,
  PaginatedResponse,
  ApiError
} from './types/api';

// Utility functions
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};
