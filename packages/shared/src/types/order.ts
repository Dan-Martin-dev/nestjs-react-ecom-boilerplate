import { Address } from './address';
import { ProductVariant } from './product';
import { Invoice } from './invoice';

// Order types and interfaces
export const PaymentMethod = {
  STRIPE: 'STRIPE',
  PAYPAL: 'PAYPAL',
  CREDIT_CARD: 'CREDIT_CARD',
  BANK_TRANSFER: 'BANK_TRANSFER',
  MERCADO_PAGO: 'MERCADO_PAGO',  // Most popular in Argentina
  RAPIPAGO: 'RAPIPAGO',          // Cash payment network in Argentina
  PAGO_FACIL: 'PAGO_FACIL',      // Cash payment network in Argentina
  BANK_DEBIT: 'BANK_DEBIT'
} as const;
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

/**
 * Order Status Enum
 * Represents the lifecycle states of an order
 */
export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

/**
 * Payment Status Enum
 * Represents the payment processing states
 * Note: Must match the database schema
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESSFUL = 'SUCCESSFUL',
  FAILED = 'FAILED',
}

/**
 * Order Item Interface (Database/API shape)
 * Represents a product variant within an order
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
        altText?: string | null;
        alt?: string | null; // Keep for backwards compatibility
        isDefault?: boolean;
        createdAt?: Date;
        productId?: string;
        [key: string]: any;
      }[];
    };
    ProductVariantAttribute?: any[];
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Order Payment Interface (Database/API shape)
 * Represents payment information for an order
 */
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
  [key: string]: any;
}

/**
 * Order Address Interface (Database/API shape)
 * Represents shipping or billing address for an order
 */
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
  [key: string]: any;
}

/**
 * Order Tracking Interface
 * Represents tracking events for an order
 */
export interface OrderTracking {
  id: string;
  orderId: string;
  status: string;
  message: string;
  timestamp: Date;
}

/**
 * Complete Order Interface (Database/API shape)
 * Represents a full order with all relations
 */
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

/**
 * Order Summary Interface
 * Represents a simplified order view for listings
 */
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

/**
 * Orders Response Interface
 * Paginated response for customer order listings
 */
export interface OrdersResponse {
  data: OrderSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Order Summary With User Interface
 * Order summary with user information (admin view)
 */
export interface OrderSummaryWithUser extends OrderSummary {
  user: {
    id: string;
    email: string;
    name: string | null;
  } | null;
}

/**
 * Admin Orders Response Interface
 * Paginated response for admin order listings
 */
export interface AdminOrdersResponse {
  data: OrderSummaryWithUser[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Cancel Order Response Interface
 * Response for order cancellation requests
 */
export interface CancelOrderResponse {
  message: string;
}

// Legacy Payment interface for backwards compatibility
export interface Payment {
  id: string;
  orderId: string;
  amount: string;
  currency: string;               // Default is 'ARS' for Argentine Peso
  paymentMethod: PaymentMethod;
  transactionId?: string;         // From payment gateway
  status: string;
  paymentDate?: string;           // When payment was successful
  installments?: number;          // Number of installments (common in Argentina: 3, 6, 12, 18 cuotas)
  installmentAmount?: string;     // Amount per installment
  installmentPlan?: string;       // Description of the installment plan (e.g., "3 cuotas sin interés")
  paymentProviderReference?: string;  // Payment provider's reference (e.g. MercadoPago operation ID)
  metadata?: Record<string, any>; // Additional gateway details
  createdAt: string;
  updatedAt?: string;
}

interface CreateOrderDto {
  shippingAddressId: string;
  billingAddressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  discountCode?: string;
  currency?: string;             // Default will be 'ARS'
  installments?: number;         // For payment methods that support installments
  installmentPlan?: string;      // Description of selected installment plan
}
