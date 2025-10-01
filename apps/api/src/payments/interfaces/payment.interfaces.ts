import { PaymentStatus } from '@repo/db';

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

export interface OrderWithPayment {
  id: string;
  orderNumber: string;
  payment?: {
    id: string;
    amount: string;
    status: PaymentStatus;
  };
}

export interface PaymentError {
  message: string;
  stack?: string;
  details?: Record<string, unknown>;
}

export interface InstallmentPlan {
  installments: number;
  installmentAmount: number;
  totalAmount: number;
  description: string;
}

export interface WebhookResponse {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

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
