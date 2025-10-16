# Stock Management Best Practices

## Overview
This guide covers comprehensive stock management for your e-commerce platform using NestJS, Prisma, and PostgreSQL.

## 🏗️ Architecture

### Database Schema
- **ProductVariant**: Stores individual variant stock levels
- **InventoryLog**: Tracks all stock changes with audit trail
- **InventoryChangeType**: SALE, RESTOCK, ADJUSTMENT, RETURN

### Services
- **InventoryService**: Core business logic for stock operations
- **InventoryController**: REST API endpoints
- **Order Integration**: Prevents overselling during checkout

## 🔒 Key Features

### 1. Race Condition Prevention
```typescript
// Uses database transactions to prevent concurrent stock issues
await this.prisma.$transaction(async (tx) => {
  // All stock operations are atomic
});
```

### 2. Stock Reservation System
```typescript
// Reserve stock during checkout (15-minute expiry)
await inventoryService.reserveStock([{
  variantId: 'variant-123',
  quantity: 2,
  reservationId: 'checkout-456',
  expiresAt: new Date(Date.now() + 15 * 60 * 1000)
}]);
```

### 3. Audit Trail
Every stock change is logged with:
- Change type (SALE, RESTOCK, ADJUSTMENT, RETURN)
- Quantity change (+/-)
- Reason/timestamp
- User context

## 📡 API Endpoints

### Check Stock Availability
```bash
GET /api/inventory/check/{variantId}?quantity=5
# Returns: { available: true, variantId: "...", requestedQuantity: 5 }
```

### Reserve Stock (Checkout)
```bash
POST /api/inventory/reserve
{
  "reservations": [{
    "variantId": "variant-123",
    "quantity": 2,
    "reservationId": "checkout-456",
    "expiresAt": "2025-10-16T15:30:00Z"
  }]
}
```

### Confirm Sale (Payment Successful)
```bash
POST /api/inventory/confirm-sale
{
  "updates": [{
    "variantId": "variant-123",
    "quantity": 2,
    "reason": "Order #12345"
  }]
}
```

### Restock Inventory
```bash
POST /api/inventory/restock
{
  "updates": [{
    "variantId": "variant-123",
    "quantity": 50,
    "reason": "New shipment received"
  }]
}
```

### Manual Adjustment
```bash
PUT /api/inventory/adjust
{
  "updates": [{
    "variantId": "variant-123",
    "quantity": 25,
    "reason": "Inventory count correction"
  }]
}
```

### Low Stock Alerts
```bash
GET /api/inventory/alerts/low-stock?threshold=5
# Returns variants with stock ≤ threshold
```

### Inventory Reports
```bash
GET /api/inventory/product/{productId}
# Returns: total stock, low stock count, variant details

GET /api/inventory/logs/{variantId}?limit=50
# Returns: audit trail of stock changes
```

## 🔄 Order Flow Integration

### 1. Add to Cart
- Check stock availability before adding
- Show "Only X left in stock" warnings

### 2. Checkout Process
```typescript
// 1. Reserve stock immediately
await inventoryService.reserveStock(reservations);

// 2. Process payment
const paymentResult = await processPayment(orderData);

// 3. On success: confirm stock reduction
if (paymentResult.success) {
  await inventoryService.confirmStockReduction(updates);
}
// 4. On failure: release reservation
else {
  await inventoryService.releaseStock(reservations);
}
```

### 3. Order Cancellation
```typescript
// Return stock to inventory
await inventoryService.adjustStock([{
  variantId: item.variantId,
  quantity: item.quantity + currentStock, // Add back to inventory
  reason: `Order cancellation: ${orderNumber}`
}]);
```

## 🎯 Best Practices

### 1. **Always Use Transactions**
```typescript
await this.prisma.$transaction(async (tx) => {
  // Multiple stock operations in one transaction
});
```

### 2. **Implement Timeouts**
- Stock reservations expire after 15 minutes
- Automatic cleanup of expired reservations

### 3. **Real-time Stock Updates**
- WebSocket notifications for stock changes
- Frontend cache invalidation

### 4. **Low Stock Alerts**
- Email notifications to admins
- Dashboard warnings
- Automatic supplier notifications

### 5. **Inventory Reconciliation**
- Regular stock counts
- Automated discrepancy detection
- Manual adjustment workflows

## 🚨 Error Handling

### Insufficient Stock
```typescript
try {
  await inventoryService.reserveStock(reservations);
} catch (error) {
  if (error.message.includes('Insufficient stock')) {
    // Handle out-of-stock scenario
    return { error: 'Item no longer available' };
  }
}
```

### Concurrent Modifications
- Database constraints prevent negative stock
- Optimistic locking for high-traffic scenarios

## 📊 Monitoring & Analytics

### Key Metrics
- Stock turnover rate
- Out-of-stock frequency
- Average inventory levels
- Stock accuracy (audit vs system)

### Alerts
- Stock below threshold
- High-selling items running low
- Unusual stock changes (potential theft/fraud)

## 🔧 Maintenance Tasks

### Daily
- Clean expired reservations
- Generate low stock reports

### Weekly
- Inventory reconciliation
- Stock movement analysis

### Monthly
- Stock optimization recommendations
- Supplier performance reviews

## 🧪 Testing

### Unit Tests
```typescript
describe('InventoryService', () => {
  it('should prevent overselling', async () => {
    // Test concurrent stock reservations
  });

  it('should handle reservation expiry', async () => {
    // Test automatic cleanup
  });
});
```

### Integration Tests
- Full order flow with stock management
- Concurrent user scenarios
- Payment failure recovery

This stock management system ensures data consistency, prevents overselling, and provides comprehensive audit trails for your e-commerce operations.
