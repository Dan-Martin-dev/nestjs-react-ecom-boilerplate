// API Types - Shared interfaces between frontend and backend
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

// Enums as const objects for better compatibility
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

// User interfaces
export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

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

// Product interfaces
export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isDefault: boolean;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: string;
  stockQuantity: number;
  ProductVariantAttribute?: ProductVariantAttribute[];
}

export interface ProductVariantAttribute {
  id: string;
  attributeId: string;
  value: string;
  attribute: Attribute;
}

export interface Attribute {
  id: string;
  name: string;
  type: string;
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

// Category interfaces
export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

// Cart interfaces
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

export interface AddToCartDto {
  productVariantId: string;
  quantity: number;
}

// Address interfaces
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

// Order interfaces
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

export interface CreateOrderDto {
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  discountCode?: string;
}

// Review interfaces
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

export interface CreateReviewDto {
  productId: string;
  rating: number;
  comment?: string;
}

// Discount interfaces
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

// Error types
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}
