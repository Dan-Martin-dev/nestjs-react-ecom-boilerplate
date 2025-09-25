import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { OrderStatus, PaymentStatus, InventoryChangeType, Role, Discount, OrderTrackingStatus } from '@repo/db'; // Import from shared db package

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<any> {
    const { 
      shippingAddressId, 
      billingAddressId, 
      paymentMethod, 
      notes, 
      discountCode,
      currency = 'ARS', // Default currency for Argentina
      installments,
      installmentPlan
    } = createOrderDto;

    // Verify addresses belong to user
    const [shippingAddress, billingAddress] = await Promise.all([
      this.prisma.address.findFirst({
        where: { id: shippingAddressId, userId },
      }),
      this.prisma.address.findFirst({
        where: { id: billingAddressId, userId },
      }),
    ]);

    if (!shippingAddress || !billingAddress) {
      throw new BadRequestException('Invalid address provided');
    }

    // Get user's cart
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
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

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Verify stock availability
    for (const item of cart.items) {
      if (item.productVariant.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for ${item.productVariant.product.name}`,
        );
      }
    }

    // Calculate total amount
    let totalAmount = cart.items.reduce(
      (total, item) => total + Number(item.priceAtAddition) * item.quantity,
      0,
    );

    // Apply discount if provided
    let appliedDiscount: Discount | null = null; // Correct type here
    if (discountCode) {
      const discount = await this.prisma.discount.findUnique({
        where: {
          code: discountCode,
          isActive: true,
        },
      });

      if (discount && this.isDiscountValid(discount)) {
        appliedDiscount = discount;

        if (discount.type === 'PERCENTAGE') {
          totalAmount = totalAmount * (1 - Number(discount.value) / 100);
        } else {
          totalAmount = Math.max(0, totalAmount - Number(discount.value));
        }

        // Update discount usage
        // This should ideally be part of the transaction as well
        await this.prisma.discount.update({
          where: { id: discount.id },
          data: { timesUsed: { increment: 1 } },
        });
      }
    }

    // Create order in transaction
    const order = await this.prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          shippingAddressId,
          billingAddressId,
          totalAmount,
          currency, // Add currency field
          notes,
          appliedDiscountId: appliedDiscount?.id, // Access id safely
          items: {
            create: cart.items.map(item => ({
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtAddition,
            })),
          },
          payment: {
            create: {
              amount: totalAmount,
              currency,
              paymentMethod,
              status: PaymentStatus.PENDING,
              installments,
              installmentPlan,
              // Calculate installment amount if installments are provided
              ...(installments && { installmentAmount: totalAmount / installments }),
            },
          },
        },
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: true,
                },
              },
            },
          },
          payment: true,
          shippingAddress: true,
          billingAddress: true,
        },
      });

      // Update inventory
      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });

        // Log inventory change
        await tx.inventoryLog.create({
          data: {
            productVariantId: item.productVariantId,
            changeType: InventoryChangeType.SALE,
            quantity: -item.quantity,
            reason: `Order ${newOrder.orderNumber}`,
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      // Create initial order tracking
      await tx.orderTracking.create({
        data: {
          orderId: newOrder.id,
          status: OrderTrackingStatus.ORDER_PLACED, // Use enum member
          message: 'Order has been placed successfully',
        },
      });

      return newOrder;
    });

    return order;
  }

  async findUserOrders(userId: string, paginationDto: PaginationDto): Promise<any> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder } = paginationDto; // Provide defaults
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          items: {
            include: {
              productVariant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      images: {
                        where: { isDefault: true },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
          payment: true,
        },
      }),
      this.prisma.order.count({ where: { userId } }),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllOrders(paginationDto: PaginationDto): Promise<any> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder } = paginationDto; // Provide defaults
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          items: {
            include: {
              productVariant: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          payment: true,
        },
      }),
      this.prisma.order.count(),
    ]);

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, orderNumber: string, userRole: Role): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            productVariant: {
              include: {
                product: {
                  include: {
                    images: true,
                  },
                },
                ProductVariantAttribute: {
                  include: {
                    attribute: true,
                  },
                },
              },
            },
          },
        },
        payment: true,
        shippingAddress: true,
        billingAddress: true,
        appliedDiscount: true,
        OrderTracking: {
          orderBy: {
            timestamp: 'desc',
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Users can only view their own orders, admins can view all
    if (userRole !== Role.ADMIN && order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  async updateOrderStatus(orderNumber: string, status: OrderStatus): Promise<any> {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const updatedOrder = await this.prisma.order.update({
      where: { orderNumber },
      data: { status },
    });

    // Create order tracking entry
    await this.prisma.orderTracking.create({
      data: {
        orderId: order.id,
        status: this.mapOrderStatusToTrackingStatus(status),
        message: `Order status updated to ${status}`,
      },
    });

    return updatedOrder;
  }

  async cancelOrder(userId: string, orderNumber: string) {
    const order = await this.prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: true,
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
      throw new BadRequestException('Order cannot be cancelled');
    }

    // Update order status and restore inventory
    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.CANCELLED },
      });

      // Restore inventory
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: {
            stockQuantity: { increment: item.quantity },
          },
        });

        // Log inventory change
        await tx.inventoryLog.create({
          data: {
            productVariantId: item.productVariantId,
            changeType: InventoryChangeType.RETURN,
            quantity: item.quantity,
            reason: `Order ${orderNumber} cancelled`,
          },
        });
      }

      // Create tracking entry
      await tx.orderTracking.create({
        data: {
          orderId: order.id,
          status: OrderTrackingStatus.EXCEPTION, // Use enum member
          message: 'Order has been cancelled by customer',
        },
      });
    });

    return { message: 'Order cancelled successfully' };
  }

  private isDiscountValid(discount: any): boolean { // Consider typing 'discount' more specifically
    const now = new Date();

    if (discount.startDate && now < discount.startDate) return false;
    if (discount.endDate && now > discount.endDate) return false;
    if (discount.usageLimit && discount.timesUsed >= discount.usageLimit) return false;
    // Add check for minimumSpend if applicable
    // if (discount.minimumSpend && totalAmount < discount.minimumSpend) return false; // Requires totalAmount here

    return true;
  }

  private mapOrderStatusToTrackingStatus(status: OrderStatus): OrderTrackingStatus { // Explicit return type
    const mapping: Record<OrderStatus, OrderTrackingStatus> = { // Explicit mapping type
      [OrderStatus.PENDING]: OrderTrackingStatus.ORDER_PLACED,
      [OrderStatus.PROCESSING]: OrderTrackingStatus.PROCESSING,
      [OrderStatus.SHIPPED]: OrderTrackingStatus.SHIPPED,
      [OrderStatus.DELIVERED]: OrderTrackingStatus.DELIVERED,
      [OrderStatus.CANCELLED]: OrderTrackingStatus.EXCEPTION,
      [OrderStatus.REFUNDED]: OrderTrackingStatus.EXCEPTION,
    };

    return mapping[status] || OrderTrackingStatus.ORDER_PLACED; // Default to ORDER_PLACED
  }
}