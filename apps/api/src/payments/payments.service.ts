import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProcessPaymentDto } from './dto/process-payment.dto';
import { PaymentMethod, PaymentStatus } from '@repo/db';
import { MercadoPagoService } from './providers/mercadopago.service';
import { RapiPagoService } from './providers/rapipago.service';
import { PagoFacilService } from './providers/pagofacil.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
    private mercadoPagoService: MercadoPagoService,
    private rapiPagoService: RapiPagoService,
    private pagoFacilService: PagoFacilService,
  ) {}

  async processPayment(orderId: string, userId: string, processPaymentDto: ProcessPaymentDto): Promise<any> {
    // Find the order and verify ownership
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        items: {
          include: {
            productVariant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to process payment for this order');
    }

    if (!order.payment) {
      throw new BadRequestException('No payment record found for this order');
    }

    if (order.payment.status === PaymentStatus.SUCCESSFUL) {
      throw new BadRequestException('Payment for this order has already been processed');
    }

    const { paymentMethod } = processPaymentDto;

    // Process payment based on the selected method
    let paymentResult;
    try {
      switch (paymentMethod) {
        case PaymentMethod.MERCADO_PAGO:
          paymentResult = await this.mercadoPagoService.processPayment(order, processPaymentDto);
          break;
        case PaymentMethod.RAPIPAGO:
          paymentResult = await this.rapiPagoService.processPayment(order, processPaymentDto);
          break;
        case PaymentMethod.PAGO_FACIL:
          paymentResult = await this.pagoFacilService.processPayment(order, processPaymentDto);
          break;
        case PaymentMethod.CREDIT_CARD:
          paymentResult = await this.processCreditCardPayment(order, processPaymentDto);
          break;
        case PaymentMethod.BANK_TRANSFER:
          paymentResult = await this.processBankTransferPayment(order, processPaymentDto);
          break;
        default:
          throw new BadRequestException(`Payment method ${paymentMethod} not supported`);
      }
    } catch (error: any) {
      // Update payment status to failed
      await this.prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          status: PaymentStatus.FAILED,
          metadata: { 
            error: error.message || 'Unknown error occurred during payment processing' 
          },
        },
      });
      throw error;
    }

    // Update the payment record with the payment result
    const { status, transactionId, paymentProviderReference, installments, installmentAmount } = paymentResult;

    const updatedPayment = await this.prisma.payment.update({
      where: { id: order.payment.id },
      data: {
        status,
        transactionId,
        paymentProviderReference,
        installments,
        installmentAmount: installmentAmount?.toString(),
        installmentPlan: processPaymentDto.installments ? 
          `${processPaymentDto.installments} cuotas` : undefined,
        paymentDate: status === PaymentStatus.SUCCESSFUL ? new Date() : undefined,
        metadata: paymentResult.metadata || {},
      },
    });

    return {
      success: status === PaymentStatus.SUCCESSFUL,
      paymentId: updatedPayment.id,
      status,
      message: paymentResult.message || 'Payment processed',
      details: paymentResult.details || {},
    };
  }

  async getPaymentInfo(paymentId: string, userId: string): Promise<any> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            userId: true,
          },
        },
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${paymentId} not found`);
    }

    if (payment.order.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this payment information');
    }

    return payment;
  }

  async handleWebhook(webhookData: any): Promise<any> {
    // Determine which payment provider the webhook is from
    if (webhookData.source === 'mercadopago') {
      return this.mercadoPagoService.handleWebhook(webhookData);
    } else if (webhookData.source === 'rapipago') {
      return this.rapiPagoService.handleWebhook(webhookData);
    } else if (webhookData.source === 'pagofacil') {
      return this.pagoFacilService.handleWebhook(webhookData);
    } else {
      throw new BadRequestException('Unknown webhook source');
    }
  }

  getAvailablePaymentMethods(): any {
    const supportedMethods = [
      {
        id: PaymentMethod.MERCADO_PAGO,
        name: 'MercadoPago',
        description: 'Pay with MercadoPago - the most popular payment method in Argentina',
        supportsInstallments: true,
      },
      {
        id: PaymentMethod.RAPIPAGO,
        name: 'RapiPago',
        description: 'Pay in cash at any RapiPago location',
        supportsInstallments: false,
      },
      {
        id: PaymentMethod.PAGO_FACIL,
        name: 'PagoFacil',
        description: 'Pay in cash at any PagoFacil location',
        supportsInstallments: false,
      },
      {
        id: PaymentMethod.CREDIT_CARD,
        name: 'Credit Card',
        description: 'Pay with credit card',
        supportsInstallments: true,
      },
      {
        id: PaymentMethod.BANK_TRANSFER,
        name: 'Bank Transfer',
        description: 'Pay via bank transfer',
        supportsInstallments: false,
      },
    ];

    return supportedMethods;
  }

  async getInstallmentPlans(paymentMethod: string, amount: number): Promise<any> {
    switch (paymentMethod) {
      case PaymentMethod.MERCADO_PAGO:
        return this.mercadoPagoService.getInstallmentPlans(amount);
      case PaymentMethod.CREDIT_CARD:
        return this.getCreditCardInstallmentPlans(amount);
      default:
        return { message: 'This payment method does not support installment plans' };
    }
  }

  async getAllPayments(): Promise<any> {
    return this.prisma.payment.findMany({
      include: {
        order: {
          select: {
            orderNumber: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Helper methods for different payment types
  private async processCreditCardPayment(order: any, paymentDto: ProcessPaymentDto): Promise<any> {
    // Implement credit card processing logic - this would integrate with a payment gateway
    // For demo purposes, we'll simulate a successful payment
    
    return {
      status: PaymentStatus.SUCCESSFUL,
      transactionId: `cc-${Date.now()}`,
      installments: paymentDto.installments,
      installmentAmount: paymentDto.installments && order.payment?.amount ? 
        Number(order.payment.amount) / paymentDto.installments : undefined,
      message: 'Credit card payment successful',
      details: {
        last4: paymentDto.cardNumber?.slice(-4) || '0000',
        cardHolder: paymentDto.cardHolder,
      },
    };
  }

  private async processBankTransferPayment(order: any, paymentDto: ProcessPaymentDto): Promise<any> {
    // Implement bank transfer processing logic
    // For demo purposes, we'll simulate a pending payment
    
    return {
      status: PaymentStatus.PENDING,
      transactionId: `bt-${Date.now()}`,
      paymentProviderReference: `TRANSFER-${order.orderNumber}`,
      installments: 1, // Bank transfers don't support installments
      installmentAmount: order.payment?.amount,
      message: 'Bank transfer initiated. Please complete the transfer within 48 hours.',
      details: {
        bankAccount: 'BA-DEMO-ACCOUNT',
        reference: `ORDER-${order.orderNumber}`,
        bankName: 'Banco de la Nación Argentina',
        accountHolder: 'ECOM 101 SRL',
        cbu: '0110000000000000000000', // Example CBU number
      },
    };
  }

  private getCreditCardInstallmentPlans(amount: number): any {
    // Standard credit card installment plans in Argentina
    const plans = [
      {
        installments: 1,
        installmentAmount: amount,
        totalAmount: amount,
        description: '1 cuota sin interés',
      },
      {
        installments: 3,
        installmentAmount: amount / 3,
        totalAmount: amount,
        description: '3 cuotas sin interés',
      },
      {
        installments: 6,
        installmentAmount: amount / 6,
        totalAmount: amount,
        description: '6 cuotas sin interés',
      },
      {
        installments: 12,
        installmentAmount: (amount * 1.15) / 12, // 15% interest
        totalAmount: amount * 1.15,
        description: '12 cuotas con interés (15%)',
      },
      {
        installments: 18,
        installmentAmount: (amount * 1.25) / 18, // 25% interest
        totalAmount: amount * 1.25,
        description: '18 cuotas con interés (25%)',
      },
    ];

    return plans;
  }
}
