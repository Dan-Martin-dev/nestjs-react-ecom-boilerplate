// Data Transfer Object types for API requests
import { Role, AddressType, PaymentMethod, DiscountType } from './enums';

// Auth DTOs (import from schemas to avoid duplication)
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    role: Role;
    createdAt: string;
    updatedAt: string;
  };
  access_token: string;
}

// Product DTOs
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

// Category DTOs
export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

// Cart DTOs
export interface AddToCartDto {
  productVariantId: string;
  quantity: number;
}

// Address DTOs
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

// Order DTOs
export interface CreateOrderDto {
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  discountCode?: string;
}

// Review DTOs
export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment?: string;
}

// Discount DTOs
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
