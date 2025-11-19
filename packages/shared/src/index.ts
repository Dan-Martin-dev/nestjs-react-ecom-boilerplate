// ============================================================================
// SCHEMA-FIRST APPROACH
// ============================================================================
// DTOs (Data Transfer Objects) are now derived from Zod schemas and exported
// from the schemas directory. Entity types (database models) are still in types/.
//
// Import DTOs from schemas:    import { CreateProductDto } from '@repo/shared/schemas'
// Import entities from types:  import { Product, Order } from '@repo/shared'
// ============================================================================

// Export entity types (database response shapes with relations)
export * from './types/category';
export * from './types/product';
export * from './types/user';
export * from './types/order';
export * from './types/payment';
export * from './types/common';
export * from './types/inventory';
export * from './types/address';
export * from './types/cart';
export * from './types/review';
export * from './types/discount';
export * from './types/invoice';

// Export auth response types (not DTOs)
export type { AuthResponse } from './types/auth';

// ============================================================================
// SCHEMA EXPORTS - DTOs and Validation
// ============================================================================
// Export all schemas and their derived types
export * from './schemas';

// For convenience, re-export commonly used schema-derived types
export type {
  // Auth DTOs
  LoginDto,
  RegisterDto,
  ChangePasswordDto,
  JwtPayload,
  
  // User DTOs
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  
  // Product DTOs
  ProductSchema as CreateProductDto,
  ProductDto,
  
  // Category DTOs
  CategorySchema as CreateCategoryDto,
  CategoryDto,
  
  // Order DTOs
  CreateOrderDto,
  OrderDto,
  OrderItemDto,
  
  // Cart DTOs
  CartDto,
  
  // Address DTOs
  AddressDto,
  
  // Review DTOs
  CreateReviewDto,
  ReviewDto,
  
  // Discount DTOs
  CreateDiscountDto,
  DiscountDto,
  
  // Common DTOs
  Pagination,
} from './schemas';

// Export schemas themselves for use in validation pipes
export {
  // Auth schemas
  LoginSchema,
  RegisterSchema,
  ChangePasswordSchema,
  JwtPayloadSchema,
  
  // User schemas
  CreateUserSchema,
  UpdateUserSchema,
  UserSchema,
  
  // Product schemas
  CreateProductSchema,
  ProductDtoSchema,
  
  // Category schemas
  CreateCategorySchema,
  CategoryDtoSchema,
  
  // Order schemas
  CreateOrderSchema,
  OrderSchema,
  OrderItemSchema,
  
  // Cart schemas
  CartSchema,
  CartItemSchema,
  
  // Address schemas
  AddressSchema,
  
  // Review schemas
  CreateReviewSchema,
  ReviewSchema,
  
  // Discount schemas
  CreateDiscountSchema,
  DiscountSchema,
  
  // Common schemas
  PaginationSchema,
} from './schemas';

