import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ProductInventorySummary } from '@repo/shared';

class StockUpdateDto {
  variantId!: string;
  quantity!: number;
  reason?: string;
}

class StockReservationDto {
  variantId!: string;
  quantity!: number;
  reservationId!: string;
  expiresAt!: Date;
}

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  /**
   * Check stock availability for a variant
   */
  @Get('check/:variantId')
  async checkStock(
    @Param('variantId') variantId: string,
    @Query('quantity') quantity: number,
  ) {
    if (!quantity || quantity <= 0) {
      throw new BadRequestException('Valid quantity required');
    }

    const available = await this.inventoryService.checkStock(
      variantId,
      quantity,
    );
    return {
      variantId,
      requestedQuantity: quantity,
      available,
    };
  }

  /**
   * Reserve stock during checkout
   */
  @Post('reserve')
  async reserveStock(@Body() reservations: StockReservationDto[]) {
    await this.inventoryService.reserveStock(reservations);
    return { success: true, message: 'Stock reserved successfully' };
  }

  /**
   * Release reserved stock (checkout failed/cancelled)
   */
  @Post('release')
  async releaseStock(@Body() reservations: StockReservationDto[]) {
    await this.inventoryService.releaseStock(reservations);
    return { success: true, message: 'Stock reservation released' };
  }

  /**
   * Confirm stock reduction (order fulfilled)
   */
  @Post('confirm-sale')
  async confirmStockReduction(@Body() updates: StockUpdateDto[]) {
    await this.inventoryService.confirmStockReduction(updates);
    return { success: true, message: 'Stock updated for sale' };
  }

  /**
   * Restock inventory
   */
  @Post('restock')
  async restock(@Body() updates: StockUpdateDto[]) {
    await this.inventoryService.restock(updates);
    return { success: true, message: 'Inventory restocked successfully' };
  }

  /**
   * Manual stock adjustment
   */
  @Put('adjust')
  async adjustStock(@Body() updates: StockUpdateDto[]) {
    await this.inventoryService.adjustStock(updates);
    return { success: true, message: 'Stock adjusted successfully' };
  }

  /**
   * Get low stock alerts
   */
  @Get('alerts/low-stock')
  async getLowStockAlerts(@Query('threshold') threshold?: number) {
    const alerts = await this.inventoryService.getLowStockAlerts(threshold);
    return {
      alerts,
      count: alerts.length,
      threshold: threshold || 5,
    };
  }

  /**
   * Get inventory summary for a product
   */
  @Get('product/:productId')
  async getProductInventory(
    @Param('productId') productId: string,
  ): Promise<ProductInventorySummary> {
    return await this.inventoryService.getProductInventory(productId);
  }

  /**
   * Get inventory logs for a variant
   */
  @Get('logs/:variantId')
  async getInventoryLogs(
    @Param('variantId') variantId: string,
    @Query('limit') limit?: number,
  ) {
    const logs = await this.inventoryService.getInventoryLogs(
      variantId,
      limit || 50,
    );

    return {
      variantId,
      logs,
      count: logs.length,
    };
  }
}
