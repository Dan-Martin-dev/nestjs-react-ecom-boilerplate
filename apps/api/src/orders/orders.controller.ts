// monorepo-ecom/backend/src/orders/orders.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, OrderStatus } from '@repo/db';
import { CreateOrderDto, CreateOrderSchema } from './dto/create-order.dto';
import { PaginationDto, PaginationSchema } from '../common/dto/pagination.dto';
import { GetUser } from '../auth/decorators/get-user.decorator';
import {
  Order,
  OrdersResponse,
  AdminOrdersResponse,
  CancelOrderResponse,
} from './interfaces/order.interfaces';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateOrderSchema))
  create(
    @GetUser('id') userId: string,
    @Body() createOrderDto: CreateOrderDto,
  ): Promise<Order> {
    return this.ordersService.create(userId, createOrderDto);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(PaginationSchema))
  findUserOrders(
    @GetUser('id') userId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<OrdersResponse> {
    return this.ordersService.findUserOrders(userId, paginationDto);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ZodValidationPipe(PaginationSchema))
  findAllOrders(
    @Query() paginationDto: PaginationDto,
  ): Promise<AdminOrdersResponse> {
    return this.ordersService.findAllOrders(paginationDto);
  }

  @Get(':orderNumber')
  findOne(
    @GetUser('id') userId: string,
    @GetUser('role') userRole: Role,
    @Param('orderNumber') orderNumber: string,
  ): Promise<Order> {
    return this.ordersService.findOne(userId, orderNumber, userRole);
  }

  @Patch(':orderNumber/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateOrderStatus(
    @Param('orderNumber') orderNumber: string,
    @Body('status') status: OrderStatus,
  ): Promise<Order> {
    return this.ordersService.updateOrderStatus(orderNumber, status);
  }

  @Post(':orderNumber/cancel')
  cancelOrder(
    @GetUser('id') userId: string,
    @Param('orderNumber') orderNumber: string,
  ): Promise<CancelOrderResponse> {
    return this.ordersService.cancelOrder(userId, orderNumber);
  }
}
