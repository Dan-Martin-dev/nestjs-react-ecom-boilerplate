import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { PaymentStatus } from '@repo/db';
import { ProcessPaymentDto } from '../dto/process-payment.dto';

@Injectable()
export class RapiPagoService {
  private readonly logger = new Logger(RapiPagoService.name);

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async processPayment(order: any, paymentDto: ProcessPaymentDto): Promise<any> {
    try {
      this.logger.log(`Processing RapiPago payment for order ${order.id}`);
      
      // For demonstration purposes, we'll simulate generating a payment voucher
      // In a real implementation, we would integrate with RapiPago's API
      
      const barcodeNumber = `RP${Date.now()}${order.orderNumber.substring(0, 6)}`;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 3); // Voucher valid for 3 days
      
      return {
        status: PaymentStatus.PENDING, // RapiPago payments are pending until paid in cash
        transactionId: barcodeNumber,
        paymentProviderReference: barcodeNumber,
        message: 'Payment voucher generated successfully. Please pay at your nearest RapiPago location.',
        details: {
          provider: 'RapiPago',
          barcodeNumber,
          expirationDate: expirationDate.toISOString(),
          amount: order.payment?.amount,
        },
        metadata: {
          barcodeNumber,
          expirationDate: expirationDate.toISOString(),
        },
      };
    } catch (error: any) {
      this.logger.error(`Error processing RapiPago payment: ${error.message}`, error.stack);
      throw new Error(`Failed to process RapiPago payment: ${error.message}`);
    }
  }

  async handleWebhook(webhookData: any): Promise<any> {
    try {
      this.logger.log('Received RapiPago webhook', webhookData);
      
      // In a real implementation, we would validate the webhook data
      // and update the payment status accordingly
      
      // Check if the webhook is for a payment confirmation
      if (webhookData.action === 'payment_received') {
        const barcodeNumber = webhookData.barcodeNumber;
        
        // Find the payment with this barcode number
        const payment = await this.prisma.payment.findFirst({
          where: {
            paymentProviderReference: barcodeNumber,
            status: PaymentStatus.PENDING,
          },
        });
        
        if (!payment) {
          this.logger.warn(`No pending payment found for barcode ${barcodeNumber}`);
          return { success: false, message: 'No pending payment found for this barcode' };
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
        
        return { success: true, message: 'Payment status updated successfully' };
      }
      
      return { success: true, message: 'Webhook processed successfully' };
    } catch (error: any) {
      this.logger.error(`Error processing RapiPago webhook: ${error.message}`, error.stack);
      throw new Error(`Failed to process RapiPago webhook: ${error.message}`);
    }
  }
}
