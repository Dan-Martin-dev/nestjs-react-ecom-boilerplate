import React from 'react';
import type { Product, ProductImage, ProductVariant } from '@repo/shared';
import {
  ProductImageCarousel,
  ProductInfo,
  VariantSelector,
  QuantitySelector,
  AddToCartButton,
  ProductAccordion,
} from '../components';

interface ProductDetailContentProps {
  product: Product;
  images: ProductImage[];
  selectedVariant: ProductVariant | null;
  selectedVariantId: string | null;
  quantity: number;
  onVariantSelect: (variantId: string) => void;
  onIncreaseQuantity: () => void;
  onDecreaseQuantity: () => void;
  onAddToCart: () => void;
  isAddToCartLoading: boolean;
}

export const ProductDetailContent: React.FC<ProductDetailContentProps> = ({
  product,
  images,
  selectedVariant,
  selectedVariantId,
  quantity,
  onVariantSelect,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onAddToCart,
  isAddToCartLoading,
}) => {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12 lg:grid lg:grid-cols-2 lg:gap-x-12">
      {/* Product Images */}
      <div className="mb-4 lg:mb-0">
        <ProductImageCarousel images={images} productName={product.name} />
      </div>

      {/* Product Details */}
      <div className="lg:pl-10">
        <ProductInfo product={product} selectedVariant={selectedVariant} />

        {/* Variants Selection */}
        {product.variants && product.variants.length > 0 && (
          <VariantSelector
            variants={product.variants}
            selectedVariantId={selectedVariantId}
            onVariantSelect={onVariantSelect}
          />
        )}

        <QuantitySelector
          quantity={quantity}
          onIncrease={onIncreaseQuantity}
          onDecrease={onDecreaseQuantity}
        />

        <AddToCartButton
          onAddToCart={onAddToCart}
          isLoading={isAddToCartLoading}
          disabled={!selectedVariantId}
        />

        <ProductAccordion description={product.description || null} />
      </div>
    </main>
  );
};
