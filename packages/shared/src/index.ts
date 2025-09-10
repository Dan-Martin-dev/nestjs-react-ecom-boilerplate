// Exporting all types from the shared package
export * from './types/category';
export * from './types/product';
export * from './types/user';

// Re-export schemas individually so consumers can import from package root
export * from './schemas/product';
export * from './schemas/category';
export * from './schemas/index';

// Also keep a namespace export for backward compatibility
export * as Schemas from './schemas';
