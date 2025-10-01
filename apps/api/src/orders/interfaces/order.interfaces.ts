import { OrderStatus, PaymentStatus } from '@repo/db';

/**
 * Order interfaces that match the actual data shapes returned by the services
 */
export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  quantity: number;
  priceAtPurchase: any; // Handle Decimal type
  productVariant: {
    id: string;
    sku: string;
    stockQuantity: number;
    product: {
      id: string;
      name: string;
      images?: {
        id: string;
        url: string;
        altText?: string | null; // Match the actual field name in Prisma
        alt?: string | null; // Keep for backwards compatibility
        isDefault?: boolean;
        createdAt?: Date;
        productId?: string;
        [key: string]: any;
      }[];
    };
    ProductVariantAttribute?: any[]; // Add this field from Prisma
    [key: string]: any; // Additional properties
  };
  [key: string]: any; // Additional properties
}

export interface OrderPayment {
  id: string;
  orderId: string;
  amount: any; // Handle Decimal type
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  installments: number | null;
  installmentAmount: any; // Handle Decimal type
  installmentPlan: string | null;
  metadata?: any;
  paymentProviderReference?: string | null;
  [key: string]: any; // For additional fields from Prisma
}

export interface OrderAddress {
  id: string;
  street: string;
  streetNumber: string | null;
  apartment: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string | null;
  type?: string;
  userId?: string;
  isDefault?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  [key: string]: any; // For additional fields from Prisma
}

export interface OrderTracking {
  id: string;
  orderId: string;
  status: string;
  message: string;
  timestamp: Date;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: OrderStatus;
  totalAmount: any; // Handle Decimal type
  currency: string;
  notes: string | null;
  shippingAddressId: string;
  billingAddressId: string;
  appliedDiscountId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  payment: OrderPayment | null;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  OrderTracking?: OrderTracking[];
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: OrderStatus;
  totalAmount: any; // Handles Decimal type
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  payment: OrderPayment | null;
}

export interface OrdersResponse {
  data: OrderSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OrderSummaryWithUser extends OrderSummary {
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
}

export interface AdminOrdersResponse {
  data: OrderSummaryWithUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CancelOrderResponse {
  message: string;
}
