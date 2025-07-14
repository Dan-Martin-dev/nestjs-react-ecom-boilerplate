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
  Request 
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { AuthGuard } from '../common/guards/auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role, OrderStatus } from '@repo/db';
import { CreateOrderDto, CreateOrderSchema } from './dto/create-order.dto';
import { PaginationDto, PaginationSchema } from '../common/dto/pagination.dto';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(CreateOrderSchema))
  create(@Request() req, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(req.user.sub, createOrderDto);
  }

  @Get()
  @UsePipes(new ZodValidationPipe(PaginationSchema))
  findUserOrders(@Request() req, @Query() paginationDto: PaginationDto) {
    return this.ordersService.findUserOrders(req.user.sub, paginationDto);
  }

  @Get('admin')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @UsePipes(new ZodValidationPipe(PaginationSchema))
  findAllOrders(@Query() paginationDto: PaginationDto) {
    return this.ordersService.findAllOrders(paginationDto);
  }

  @Get(':orderNumber')
  findOne(@Request() req, @Param('orderNumber') orderNumber: string) {
    return this.ordersService.findOne(req.user.sub, orderNumber, req.user.role);
  }

  @Patch(':orderNumber/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateOrderStatus(
    @Param('orderNumber') orderNumber: string,
    @Body('status') status: OrderStatus,
  ) {
    return this.ordersService.updateOrderStatus(orderNumber, status);
  }

  @Post(':orderNumber/cancel')
  cancelOrder(@Request() req, @Param('orderNumber') orderNumber: string) {
    return this.ordersService.cancelOrder(req.user.sub, orderNumber);
  }
}