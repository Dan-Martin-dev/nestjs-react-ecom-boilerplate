// Payment-related types and interfaces
import { PaymentStatus } from './order';

/**
 * Payment Response Interface
 * Response from payment processing operations
 */
export interface PaymentResponse {
  status: PaymentStatus;
  transactionId: string;
  paymentProviderReference: string;
  installments: number;
  installmentAmount: number;
  message: string;
  details: {
    provider: string;
    status: string;
    [key: string]: unknown;
  };
  metadata: Record<string, unknown>;
}

/**
 * Order With Payment Interface
 * Simplified order view with payment information
 */
export interface OrderWithPayment {
  id: string;
  orderNumber: string;
  payment?: {
    id: string;
    amount: string;
    status: PaymentStatus;
  };
}

/**
 * Payment Error Interface
 * Error details from payment operations
 */
export interface PaymentError {
  message: string;
  stack?: string;
  details?: Record<string, unknown>;
}

/**
 * Installment Plan Interface
 * Represents an installment payment plan
 */
export interface InstallmentPlan {
  installments: number;
  installmentAmount: number;
  totalAmount: number;
  description: string;
}

/**
 * Webhook Response Interface
 * Response for payment webhook processing
 */
export interface WebhookResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

/**
 * Payment Provider Response Interface
 * Raw response from payment provider (e.g., MercadoPago)
 */
export interface PaymentProviderResponse {
  status: string;
  id: string;
  installments: number;
  installment_amount: number;
  transaction_details: {
    net_received_amount: number | string;
  };
  [key: string]: unknown;
}
