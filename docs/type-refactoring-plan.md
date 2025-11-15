# Type Refactoring Plan - API Code Organization

## Overview

This document outlines the comprehensive plan to reorganize types and interfaces across the API codebase to follow best practices. The goal is to eliminate duplication, improve maintainability, and ensure proper separation of concerns.

## Current Issues

- **Duplicated types** across multiple files (e.g., `ProductFilterDto`, `LoginDto`)
- **Business logic interfaces** scattered in service-specific files
- **Common utilities** not shared where they should be
- **Inconsistent organization** of types vs schemas

## Refactoring Plan

### Priority Classification

- 🔴 **HIGH**: Core business entities used across multiple modules
- 🟡 **MEDIUM**: Common utilities or interfaces with cross-module usage
- 🟢 **LOW**: Service-specific or controller-specific types

---

## 🔴 HIGH PRIORITY - Move to Shared

### 1. Order Interfaces

**Current Location:** `apps/api/src/orders/interfaces/order.interfaces.ts`  
**Target Location:** `packages/shared/src/types/order.ts`

**Interfaces to Move:**
- `OrderItem`
- `OrderPayment`
- `OrderAddress`
- `OrderTracking`
- `Order`
- `OrderSummary`
- `OrdersResponse`
- `OrderSummaryWithUser`
- `AdminOrdersResponse`
- `CancelOrderResponse`

**Enums to Move:**
- `OrderStatus`
- `PaymentStatus`

**Rationale:**
These interfaces define the complete shape of order data used across:
- Order controllers and services
- Payment processing
- Frontend order displays
- Admin dashboards
- API responses

**Impact:** High - affects order management, payments, and admin features.

---

### 2. Payment Interfaces

**Current Location:** `apps/api/src/payments/interfaces/payment.interfaces.ts`  
**Target Location:** `packages/shared/src/types/payment.ts`

**Interfaces to Move:**
- `PaymentResponse`
- `OrderWithPayment`
- `PaymentError`
- `InstallmentPlan`
- `WebhookResponse`
- `PaymentProviderResponse`

**Rationale:**
Payment interfaces are used across:
- Payment processing services
- Order completion workflows
- Webhook handling
- Frontend payment flows
- Error handling across payment operations

**Impact:** High - affects payment processing and order completion.

---

### 3. Pagination Types

**Current Location:** `apps/api/src/common/dto/pagination.dto.ts`  
**Target Location:** `packages/shared/src/types/common.ts`

**Types to Move:**
- `PaginationSchema` (Zod schema)
- `PaginationDto` (class with decorators)

**Rationale:**
Pagination is used across multiple modules:
- Products listing (`/products`)
- Orders listing (`/orders`)
- Users listing (`/users`)
- Categories listing (`/categories`)
- Any future list endpoints

**Impact:** Medium - affects all list endpoints but is a common utility.

---

### 4. ProductWithRelated Interface

**Current Location:** `apps/api/src/products/products.controller.ts`  
**Target Location:** `packages/shared/src/types/product.ts`

**Interface to Move:**
- `ProductWithRelated extends Product`

**Rationale:**
This interface represents a product with its related products for "available in other colors" features. Used in:
- Product detail pages
- Related product recommendations
- API responses for enhanced product data

**Impact:** Low - specific to product features but extends core Product type.

---

## � HIGH PRIORITY - Move to Shared (Continued)

### 5. Inventory Interfaces

**Current Location:** `apps/api/src/products/inventory.service.ts`  
**Target Location:** `packages/shared/src/types/inventory.ts`

**Interfaces to Move:**
- `ProductInventorySummary`
- `StockUpdate`
- `StockReservation`

**Rationale:**
✅ **Analysis Complete**: These interfaces are used in:

- Inventory controller (imports ProductInventorySummary)
- Multiple service methods (public API)
- Order processing (stock validation)
- Admin inventory dashboards

They represent core business entities for stock management.

**Impact:** High - affects inventory management and order processing.

---

## 🟢 LOW PRIORITY - Keep Local

### 6. Image Processing Interfaces

**Current Location:** `apps/api/src/common/services/image-processing.service.ts`  
**Should Stay:** Local to service

**Interfaces:**
- `ImageProcessingOptions`
- `PrintRequirements`

**Rationale:**
These interfaces are specific to image processing operations and are only used within the image processing service. They don't represent business entities or cross-cutting concerns.

---

### 7. User Response Type

**Current Location:** `apps/api/src/users/users.controller.ts`  
**Should Stay:** Local to controller

**Type:**
```typescript
type UserResponse = {
  id: string;
  email: string;
  name: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
};
```

**Rationale:**
This is a controller-specific response transformation that formats user data for API responses. It's tightly coupled to the controller's response logic.

---

### 8. RequestWithUser Interface

**Current Location:** `apps/api/src/common/decorators/user.decorator.ts`  
**Should Stay:** Local to decorator

**Interface:**
```typescript
interface RequestWithUser {
  user?: JwtPayload;
}
```

**Rationale:**
This interface is specific to the user decorator's internal logic for extending Express Request objects. It's decorator-specific and not used elsewhere.

---

## Implementation Steps

### Phase 1: Create Shared Type Files

1. Create `packages/shared/src/types/order.ts`
2. Create `packages/shared/src/types/payment.ts`
3. Create `packages/shared/src/types/common.ts`
4. Update `packages/shared/src/types/product.ts` (add ProductWithRelated)

### Phase 2: Move High Priority Interfaces

1. Move order interfaces with proper enum definitions
2. Move payment interfaces
3. Move pagination types
4. Move ProductWithRelated interface

### Phase 3: Update Imports

1. Update all import statements across the codebase
2. Remove old interface files
3. Update shared package exports in `packages/shared/src/index.ts`

### Phase 4: Testing & Validation

1. Run full test suite
2. Run linting checks
3. Verify TypeScript compilation
4. Test API endpoints

### Phase 5: Cleanup

1. Remove empty interface files
2. Update documentation
3. Code review

## Benefits

- **Reduced Duplication**: Eliminate duplicate type definitions
- **Better Maintainability**: Single source of truth for shared types
- **Improved Type Safety**: Consistent types across frontend/backend
- **Enhanced Developer Experience**: Better IntelliSense and refactoring
- **Future-Proof**: Easier to add new features using existing types

## Files to Create

```
packages/shared/src/types/
├── order.ts          # Order-related interfaces
├── payment.ts        # Payment-related interfaces  
├── common.ts         # Common utilities (pagination)
└── inventory.ts      # Inventory interfaces (if needed)
```

## Files to Modify

- `packages/shared/src/index.ts` - Add new type exports
- All API controllers/services that import moved types
- Remove old interface files after migration

## Risk Assessment

- **High Risk**: Order interfaces (affects core business logic)
- **Medium Risk**: Payment interfaces (affects payment processing)
- **Low Risk**: Pagination, ProductWithRelated (utility functions)

## Dependencies

- Must be done after schema consolidation
- Requires updating all import statements
- May require frontend type updates if shared with web app

---

*Last Updated: November 15, 2025*  
*Status: Planning Phase*
