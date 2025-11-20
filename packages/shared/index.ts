// Main export file for the shared package

// Export entity types (database response shapes)
export * from './src/types/common';
export * from './src/types/user';
export * from './src/types/product';
export * from './src/types/category';
export * from './src/types/cart';
export * from './src/types/order';
export * from './src/types/address';
export * from './src/types/review';
export * from './src/types/discount';
export * from './src/types/invoice';
export * from './src/types/payment';
export * from './src/types/inventory';

// Export only AuthResponse from auth types (DTOs come from schemas)
export type { AuthResponse } from './src/types/auth';

// Re-export all schemas for validation and DTOs
export * from './src/schemas';

// Keep namespaced export for backward compatibility
export * as Schemas from './src/schemas';
