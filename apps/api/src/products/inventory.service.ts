import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface ProductInventorySummary {
  productId: string;
  totalVariants: number;
  totalStock: number;
  lowStockVariants: number;
  outOfStockVariants: number;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    stockQuantity: number;
    attributes: Array<{
      name: string;
      value: string;
    }>;
  }>;
}

export interface StockUpdate {
  variantId: string;
  quantity: number;
  reason?: string;
}

export interface StockReservation {
  variantId: string;
  quantity: number;
  reservationId: string;
  expiresAt: Date;
}

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Check if variant has sufficient stock
   */
  async checkStock(
    variantId: string,
    requestedQuantity: number,
  ): Promise<boolean> {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { stockQuantity: true, name: true },
    });

    if (!variant) {
      throw new BadRequestException(`Variant ${variantId} not found`);
    }

    return variant.stockQuantity >= requestedQuantity;
  }

  /**
   * Reserve stock for checkout (prevents overselling)
   */
  async reserveStock(reservations: StockReservation[]): Promise<void> {
    // Use transaction to ensure atomicity
    await this.prisma.$transaction(async (tx) => {
      for (const reservation of reservations) {
        const variant = await tx.productVariant.findUnique({
          where: { id: reservation.variantId },
          select: { stockQuantity: true, name: true },
        });

        if (!variant) {
          throw new BadRequestException(
            `Variant ${reservation.variantId} not found`,
          );
        }

        if (variant.stockQuantity < reservation.quantity) {
          throw new BadRequestException(
            `Insufficient stock for ${variant.name}. Available: ${variant.stockQuantity}, Requested: ${reservation.quantity}`,
          );
        }

        // Temporarily reduce stock (will be restored if checkout fails)
        await tx.productVariant.update({
          where: { id: reservation.variantId },
          data: {
            stockQuantity: { decrement: reservation.quantity },
          },
        });

        // Log the reservation
        await tx.inventoryLog.create({
          data: {
            productVariantId: reservation.variantId,
            changeType: 'ADJUSTMENT',
            quantity: -reservation.quantity,
            reason: `Stock reserved for checkout (ID: ${reservation.reservationId})`,
          },
        });
      }
    });
  }

  /**
   * Release reserved stock (when checkout fails or is cancelled)
   */
  async releaseStock(reservations: StockReservation[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const reservation of reservations) {
        await tx.productVariant.update({
          where: { id: reservation.variantId },
          data: {
            stockQuantity: { increment: reservation.quantity },
          },
        });

        await tx.inventoryLog.create({
          data: {
            productVariantId: reservation.variantId,
            changeType: 'ADJUSTMENT',
            quantity: reservation.quantity,
            reason: `Stock reservation released (ID: ${reservation.reservationId})`,
          },
        });
      }
    });
  }

  /**
   * Confirm stock reduction (when order is fulfilled)
   */
  async confirmStockReduction(updates: StockUpdate[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const update of updates) {
        // Check current stock before updating
        const variant = await tx.productVariant.findUnique({
          where: { id: update.variantId },
          select: { stockQuantity: true, name: true },
        });

        if (!variant) {
          throw new BadRequestException(
            `Variant ${update.variantId} not found`,
          );
        }

        if (variant.stockQuantity < update.quantity) {
          throw new BadRequestException(
            `Cannot reduce stock for ${variant.name}. Current: ${variant.stockQuantity}, Requested reduction: ${update.quantity}`,
          );
        }

        await tx.productVariant.update({
          where: { id: update.variantId },
          data: {
            stockQuantity: { decrement: update.quantity },
          },
        });

        await tx.inventoryLog.create({
          data: {
            productVariantId: update.variantId,
            changeType: 'SALE',
            quantity: -update.quantity,
            reason: update.reason || 'Order fulfilled',
          },
        });
      }
    });
  }

  /**
   * Restock items (when receiving new inventory)
   */
  async restock(updates: StockUpdate[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const update of updates) {
        await tx.productVariant.update({
          where: { id: update.variantId },
          data: {
            stockQuantity: { increment: update.quantity },
          },
        });

        await tx.inventoryLog.create({
          data: {
            productVariantId: update.variantId,
            changeType: 'RESTOCK',
            quantity: update.quantity,
            reason: update.reason || 'Inventory restocked',
          },
        });
      }
    });
  }

  /**
   * Manual stock adjustment (for corrections)
   */
  async adjustStock(updates: StockUpdate[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const update of updates) {
        const currentVariant = await tx.productVariant.findUnique({
          where: { id: update.variantId },
          select: { stockQuantity: true },
        });

        if (!currentVariant) {
          throw new BadRequestException(
            `Variant ${update.variantId} not found`,
          );
        }

        await tx.productVariant.update({
          where: { id: update.variantId },
          data: {
            stockQuantity: update.quantity, // Set absolute quantity
          },
        });

        const quantityChange = update.quantity - currentVariant.stockQuantity;

        await tx.inventoryLog.create({
          data: {
            productVariantId: update.variantId,
            changeType: 'ADJUSTMENT',
            quantity: quantityChange,
            reason: update.reason || 'Manual stock adjustment',
          },
        });
      }
    });
  }

  /**
   * Get low stock alerts
   */
  async getLowStockAlerts(threshold: number = 5): Promise<any[]> {
    return this.prisma.productVariant.findMany({
      where: {
        stockQuantity: {
          lte: threshold,
          gt: 0, // Don't include out-of-stock items
        },
      },
      include: {
        product: {
          select: { name: true, slug: true },
        },
      },
      orderBy: { stockQuantity: 'asc' },
    });
  }

  /**
   * Get inventory logs for a variant (public method for controller access)
   */
  async getInventoryLogs(variantId: string, limit: number = 50) {
    return this.prisma.inventoryLog.findMany({
      where: { productVariantId: variantId },
      include: {
        productVariant: {
          select: { name: true, sku: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Get inventory summary for a product
   */
  async getProductInventory(
    productId: string,
  ): Promise<ProductInventorySummary> {
    const variants = await this.prisma.productVariant.findMany({
      where: { productId },
      select: {
        id: true,
        name: true,
        sku: true,
        stockQuantity: true,
        ProductVariantAttribute: {
          include: {
            attribute: true,
          },
        },
      },
    });

    const totalStock = variants.reduce(
      (sum, variant) => sum + variant.stockQuantity,
      0,
    );
    const lowStockVariants = variants.filter((v) => v.stockQuantity <= 5);
    const outOfStockVariants = variants.filter((v) => v.stockQuantity === 0);

    return {
      productId,
      totalVariants: variants.length,
      totalStock,
      lowStockVariants: lowStockVariants.length,
      outOfStockVariants: outOfStockVariants.length,
      variants: variants.map((v) => ({
        id: v.id,
        name: v.name,
        sku: v.sku,
        stockQuantity: v.stockQuantity,
        attributes: v.ProductVariantAttribute.map((attr) => ({
          name: attr.attribute.name,
          value: attr.value,
        })),
      })),
    };
  }
}
