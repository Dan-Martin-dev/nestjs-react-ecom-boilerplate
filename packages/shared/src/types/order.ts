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

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export interface OrderItem {
  id: string;
  orderId: string;
  productVariantId: string;
  quantity: number;
  priceAtPurchase: string;
  productVariant: ProductVariant & {
    product: {
      id: string;
      name: string;
      slug: string;
      images?: { id: string; url: string; isDefault: boolean; }[];
    };
  };
}

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



export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  currency: string;          // ISO currency code (ARS for Argentine Peso)
  shippingAddressId: string;
  billingAddressId: string;
  notes?: string;
  items: OrderItem[];
  payment: Payment;
  invoice?: Invoice;         // The invoice associated with this order
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
  currency?: string;             // Default will be 'ARS'
  installments?: number;         // For payment methods that support installments
  installmentPlan?: string;      // Description of selected installment plan
}
