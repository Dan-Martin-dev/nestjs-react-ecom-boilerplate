import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  UsePipes,
  Get,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  ProcessPaymentDto,
  ProcessPaymentSchema,
} from './dto/process-payment.dto';
import { Role } from '@repo/db';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process/:orderId')
  @UsePipes(new ZodValidationPipe(ProcessPaymentSchema))
  processPayment(
    @Param('orderId') orderId: string,
    @Body() processPaymentDto: ProcessPaymentDto,
    @GetUser('id') userId: string,
  ): Promise<any> {
    return this.paymentsService.processPayment(
      orderId,
      userId,
      processPaymentDto,
    );
  }

  @Get('methods')
  getPaymentMethods(): any {
    return this.paymentsService.getAvailablePaymentMethods();
  }

  @Get('installment-plans/:paymentMethod/:amount')
  getInstallmentPlans(
    @Param('paymentMethod') paymentMethod: string,
    @Param('amount') amount: string,
  ): Promise<any> {
    return this.paymentsService.getInstallmentPlans(
      paymentMethod,
      parseFloat(amount),
    );
  }

  @Get(':id')
  getPaymentInfo(
    @Param('id') id: string,
    @GetUser('id') userId: string,
  ): Promise<any> {
    return this.paymentsService.getPaymentInfo(id, userId);
  }

  @Post('webhook')
  handlePaymentWebhook(@Body() webhookData: any): Promise<any> {
    return this.paymentsService.handleWebhook(webhookData);
  }

  @Get('admin/payments')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getAllPayments(): Promise<any> {
    return this.paymentsService.getAllPayments();
  }
}
