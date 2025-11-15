// Exporting all types from the shared package
export * from './types/category';
export * from './types/product';
export * from './types/user';
export * from './types/order';
export * from './types/payment';
export * from './types/common';
export * from './types/inventory';
export * from './types/address';

// Export auth types (excluding DTOs which come from schemas)
export type { AuthResponse, JwtPayload } from './types/auth';

// Re-export schemas individually so consumers can import from package root
export * from './schemas/product';
export * from './schemas/category';
export * from './schemas/auth';
export * from './schemas/index';

// Also keep a namespace export for backward compatibility
export * as Schemas from './schemas';
