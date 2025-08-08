// =============================================================================
// SHARED TYPES FOR ECOMMERCE MONOREPO
// Single source of truth for all types shared between API and Web apps
// =============================================================================

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export const Role = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN'
} as const;
export type Role = typeof Role[keyof typeof Role];

export const AddressType = {
  SHIPPING: 'SHIPPING',
  BILLING: 'BILLING'
} as const;
export type AddressType = typeof AddressType[keyof typeof AddressType];

export const PaymentMethod = {
  STRIPE: 'STRIPE',
  PAYPAL: 'PAYPAL'
} as const;
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const DiscountType = {
  PERCENTAGE: 'PERCENTAGE',
  FIXED_AMOUNT: 'FIXED_AMOUNT'
} as const;
export type DiscountType = typeof DiscountType[keyof typeof DiscountType];

// =============================================================================
// CORE ENTITY INTERFACES
// =============================================================================

export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    Product: number;
  };
}

export interface Attribute {
  id: string;
  name: string;
  type: string;
}

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isDefault: boolean;
}

export interface ProductVariantAttribute {
  id: string;
  attributeId: string;
  value: string;
  attribute: Attribute;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: string;
  stockQuantity: number;
  ProductVariantAttribute?: ProductVariantAttribute[];
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: string;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  categories: Category[];
  images: ProductImage[];
  variants: ProductVariant[];
  reviews?: Review[];
  _count?: {
    reviews: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  street: string;
  streetNumber?: string;
  city: string;
  province: string;
  zipCode: string;
  neighborhood?: string;
  floor?: string;
  apartment?: string;
  country: string;
  type: AddressType;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productVariantId: string;
  quantity: number;
  priceAtAddition: string;
  productVariant: ProductVariant & {
    product: Product;
  };
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  quantity: number;
  priceAtPurchase: string;
  productVariant: ProductVariant & {
    product: Product;
  };
}

export interface Payment {
  id: string;
  orderId: string;
  amount: string;
  paymentMethod: PaymentMethod;
  status: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  shippingAddressId: string;
  billingAddressId: string;
  notes?: string;
  items: OrderItem[];
  payment: Payment;
  shippingAddress: Address;
  billingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  comment?: string;
  user: {
    id: string;
    name?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Discount {
  id: string;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  usageLimit?: number;
  usageLimitPerUser?: number;
  minimumSpend?: number;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// API RESPONSE INTERFACES
// =============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// =============================================================================
// AUTH DTOs
// =============================================================================

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
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// =============================================================================
// PRODUCT DTOs
// =============================================================================

export interface CreateProductDto {
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryIds: string[];
  images?: {
    url: string;
    altText?: string;
    isDefault?: boolean;
  }[];
  variants: {
    name: string;
    sku: string;
    price: number;
    stockQuantity: number;
    attributes?: {
      attributeId: string;
      value: string;
    }[];
  }[];
  metaTitle?: string;
  metaDescription?: string;
}

export interface ProductFilterDto {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  inStock?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Legacy interface for backward compatibility with frontend
export interface ProductFilters {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  search?: string;
  sortBy?: 'name' | 'price' | 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// =============================================================================
// CATEGORY DTOs
// =============================================================================

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

// =============================================================================
// CART DTOs
// =============================================================================

export interface AddToCartDto {
  productVariantId: string;
  quantity: number;
}

// =============================================================================
// ADDRESS DTOs
// =============================================================================

export interface CreateAddressDto {
  street: string;
  streetNumber?: string;
  city: string;
  province: string;
  zipCode: string;
  neighborhood?: string;
  floor?: string;
  apartment?: string;
  country: string;
  type: AddressType;
  isDefault?: boolean;
}

// =============================================================================
// ORDER DTOs
// =============================================================================

export interface CreateOrderDto {
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  discountCode?: string;
}

// =============================================================================
// REVIEW DTOs
// =============================================================================

export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment?: string;
}

// =============================================================================
// DISCOUNT DTOs
// =============================================================================

export interface CreateDiscountDto {
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  startDate?: Date;
  endDate?: Date;
  isActive?: boolean;
  usageLimit?: number;
  usageLimitPerUser?: number;
  minimumSpend?: number;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatPrice = (price: number | string): string => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numericPrice);
};

// =============================================================================
// ZOD SCHEMAS (for validation)
// =============================================================================

import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Product slug is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  categoryIds: z.array(z.string()),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    altText: z.string().optional(),
    isDefault: z.boolean().optional(),
  })).optional(),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    sku: z.string().min(1, 'SKU is required'),
    price: z.number().positive('Price must be positive'),
    stockQuantity: z.number().min(0, 'Stock quantity cannot be negative'),
    attributes: z.array(z.object({
      attributeId: z.string(),
      value: z.string(),
    })).optional(),
  })),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  slug: z.string().min(1, 'Category slug is required'),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export const AddToCartSchema = z.object({
  productVariantId: z.string().min(1, 'Product variant ID is required'),
  quantity: z.number().positive('Quantity must be positive'),
});

export const CreateAddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  streetNumber: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  province: z.string().min(1, 'Province is required'),
  zipCode: z.string().min(1, 'ZIP code is required'),
  neighborhood: z.string().optional(),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  type: z.enum(['SHIPPING', 'BILLING']),
  isDefault: z.boolean().optional(),
});

export const CreateOrderSchema = z.object({
  shippingAddressId: z.string().min(1, 'Shipping address ID is required'),
  billingAddressId: z.string().min(1, 'Billing address ID is required'),
  paymentMethod: z.enum(['STRIPE', 'PAYPAL']),
  notes: z.string().optional(),
  discountCode: z.string().optional(),
});

export const CreateReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().optional(),
});

export const CreateDiscountSchema = z.object({
  code: z.string().min(1, 'Discount code is required'),
  description: z.string().optional(),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  value: z.number().positive('Value must be positive'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  isActive: z.boolean().optional(),
  usageLimit: z.number().positive().optional(),
  usageLimitPerUser: z.number().positive().optional(),
  minimumSpend: z.number().positive().optional(),
  applicableProductIds: z.array(z.string()).optional(),
  applicableCategoryIds: z.array(z.string()).optional(),
});
