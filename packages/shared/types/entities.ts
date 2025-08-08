// Core entity interfaces for the ecommerce application
import { Role, AddressType, PaymentMethod, OrderStatus, DiscountType } from './enums';

// User interfaces
export interface User {
  id: string;
  email: string;
  name?: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// Product interfaces
export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isDefault: boolean;
}

export interface Attribute {
  id: string;
  name: string;
  type: string;
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
  price: string; // Use string for Prisma Decimal consistency
  stockQuantity: number;
  ProductVariantAttribute?: ProductVariantAttribute[];
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
  price: string; // Use string for Prisma Decimal consistency
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
