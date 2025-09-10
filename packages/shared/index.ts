// Main export file for the shared package
export * from './src/types';

// Re-export schemas so consumers can import them from the package root
export * from './src/schemas/product';
export * from './src/schemas/category';
export * from './src/schemas/index';

// Keep namespaced export
export * as Schemas from './src/schemas';
