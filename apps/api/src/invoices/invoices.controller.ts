import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  UsePipes,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { InvoicesService } from './invoices.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@repo/db';
import {
  CreateInvoiceDto,
  CreateInvoiceSchema,
} from './dto/create-invoice.dto';

// Define request interface with user property
interface RequestWithUser extends Request {
  user: {
    sub: string;
    role: Role;
  };
}

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  // Admin only - create invoice
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ZodValidationPipe(CreateInvoiceSchema))
  create(@Body() createInvoiceDto: CreateInvoiceDto): Promise<any> {
    return this.invoicesService.create(createInvoiceDto);
  }

  // Get invoice by order ID - MUST be before the :id route to avoid route conflicts
  @Get('order/:orderId')
  async findByOrder(
    @Req() req: RequestWithUser,
    @Param('orderId') orderId: string,
  ): Promise<any> {
    // If not admin, check that the order belongs to the user
    if (req.user.role !== Role.ADMIN) {
      const order = await this.invoicesService.getOrderById(orderId);
      if (
        !order ||
        typeof order !== 'object' ||
        !('userId' in order) ||
        order.userId !== req.user.sub
      ) {
        throw new ForbiddenException('Access denied');
      }
    }

    return this.invoicesService.findByOrder(orderId);
  }

  // Get invoice by ID
  @Get(':id')
  async findOne(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<any> {
    const invoice = await this.invoicesService.findOne(id);

    // If not admin, check that the invoice belongs to the user
    if (req.user.role !== Role.ADMIN) {
      const order = await this.invoicesService.getOrderByInvoiceId(id);
      if (
        !order ||
        typeof order !== 'object' ||
        !('userId' in order) ||
        order.userId !== req.user.sub
      ) {
        throw new ForbiddenException('Access denied');
      }
    }

    return invoice;
  }

  // Admin only - get all invoices with pagination
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll(): Promise<any> {
    return this.invoicesService.findAll();
  }
}
