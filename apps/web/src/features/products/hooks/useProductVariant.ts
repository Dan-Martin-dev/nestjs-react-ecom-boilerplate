import { useState, useEffect } from 'react';
import type { Product, ProductVariant } from '@repo/shared';

export const useProductVariant = (product: Product | undefined) => {
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Find selected variant
  useEffect(() => {
    if (product?.variants && selectedVariantId) {
      const variant = product.variants.find(v => v.id === selectedVariantId);
      setSelectedVariant(variant || null);
    }
  }, [selectedVariantId, product]);

  // Set default variant
  useEffect(() => {
    if (!selectedVariantId && product?.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id);
    }
  }, [product, selectedVariantId]);

  return {
    selectedVariantId,
    selectedVariant,
    setSelectedVariantId,
  };
};
