// Inventory-related types and interfaces

/**
 * Product Inventory Summary Interface
 * Comprehensive view of product stock across all variants
 */
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

/**
 * Stock Update Interface
 * Represents a stock quantity change for a variant
 */
export interface StockUpdate {
  variantId: string;
  quantity: number;
  reason?: string;
}

/**
 * Stock Reservation Interface
 * Temporary hold on stock for order processing
 */
export interface StockReservation {
  variantId: string;
  quantity: number;
  reservationId: string;
  expiresAt: Date;
}

/**
 * Low Stock Alert Interface
 * Notification for products below threshold
 */
export interface LowStockAlert {
  variantId: string;
  productName: string;
  sku: string;
  currentStock: number;
  threshold: number;
}

/**
 * Stock Movement Interface
 * Audit trail for stock changes
 */
export interface StockMovement {
  id: string;
  variantId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RESERVATION' | 'RELEASE';
  quantity: number;
  reason?: string;
  userId?: string;
  createdAt: Date;
}
