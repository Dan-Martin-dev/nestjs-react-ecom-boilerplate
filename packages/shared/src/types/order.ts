import { Address } from './address';
import { ProductVariant } from './product';

// Order types and interfaces
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
