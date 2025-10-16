// Example: Update order service to use inventory management
import { Injectable } from '@nestjs/common';
import { InventoryService } from '../products/inventory.service';

interface OrderItem {
  variantId: string;
  quantity: number;
}

interface OrderData {
  items: OrderItem[];
  reservationId: string;
  orderNumber: string;
}

@Injectable()
export class OrdersService {
  constructor(private inventoryService: InventoryService) {}

  async createOrder(orderData: OrderData) {
    // 1. Reserve stock during checkout
    const reservations = orderData.items.map((item) => ({
      variantId: item.variantId,
      quantity: item.quantity,
      reservationId: orderData.reservationId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    }));

    await this.inventoryService.reserveStock(reservations);

    // 2. Process payment...
    const paymentSuccessful = true; // This would be actual payment logic

    // 3. If payment successful, confirm stock reduction
    if (paymentSuccessful) {
      await this.inventoryService.confirmStockReduction(
        orderData.items.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
          reason: `Order ${orderData.orderNumber}`,
        })),
      );
    } else {
      // 4. If payment failed, release reserved stock
      await this.inventoryService.releaseStock(reservations);
    }
  }
}
