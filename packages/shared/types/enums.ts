// Shared enums and constants for the ecommerce monorepo

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
