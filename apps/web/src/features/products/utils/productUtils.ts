import type { Product, ProductImage } from '@repo/shared';

export const getProductImages = (product: Product | undefined): ProductImage[] => {
  return (product?.images as ProductImage[]) ?? [];
};
