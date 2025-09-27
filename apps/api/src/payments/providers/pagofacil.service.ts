import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@repo/db';
import { ProcessPaymentDto } from '../dto/process-payment.dto';

@Injectable()
export class PagoFacilService {
  private readonly logger = new Logger(PagoFacilService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async processPayment(
    order: any,
    paymentDto: ProcessPaymentDto,
  ): Promise<any> {
    try {
      this.logger.log(`Processing PagoFacil payment for order ${order.id}`);

      // For demonstration purposes, we'll simulate generating a payment voucher
      // In a real implementation, we would integrate with PagoFacil's API

      const voucherCode = `PF${Date.now()}${order.orderNumber.substring(0, 6)}`;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 5); // Voucher valid for 5 days

      return {
        status: PaymentStatus.PENDING, // PagoFacil payments are pending until paid in cash
        transactionId: voucherCode,
        paymentProviderReference: voucherCode,
        message:
          'Payment voucher generated successfully. Please pay at your nearest PagoFacil location.',
        details: {
          provider: 'PagoFacil',
          voucherCode,
          expirationDate: expirationDate.toISOString(),
          amount: order.payment?.amount,
        },
        metadata: {
          voucherCode,
          expirationDate: expirationDate.toISOString(),
        },
      };
    } catch (error: any) {
      this.logger.error(
        `Error processing PagoFacil payment: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to process PagoFacil payment: ${error.message}`);
    }
  }

  async handleWebhook(webhookData: any): Promise<any> {
    try {
      this.logger.log('Received PagoFacil webhook', webhookData);

      // In a real implementation, we would validate the webhook data
      // and update the payment status accordingly

      // Check if the webhook is for a payment confirmation
      if (webhookData.action === 'payment_received') {
        const voucherCode = webhookData.voucherCode;

        // Find the payment with this voucher code
        const payment = await this.prisma.payment.findFirst({
          where: {
            paymentProviderReference: voucherCode,
            status: PaymentStatus.PENDING,
          },
        });

        if (!payment) {
          this.logger.warn(
            `No pending payment found for voucher ${voucherCode}`,
          );
          return {
            success: false,
            message: 'No pending payment found for this voucher',
          };
        }

        // Update the payment status to successful
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESSFUL,
            paymentDate: new Date(),
            metadata: {
              ...(payment.metadata as Record<string, unknown>),
              webhookData,
              paidAt: new Date().toISOString(),
            },
          },
        });

        return {
          success: true,
          message: 'Payment status updated successfully',
        };
      }

      return { success: true, message: 'Webhook processed successfully' };
    } catch (error: any) {
      this.logger.error(
        `Error processing PagoFacil webhook: ${error.message}`,
        error.stack,
      );
      throw new Error(`Failed to process PagoFacil webhook: ${error.message}`);
    }
  }
}
