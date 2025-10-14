import React from 'react';
import type { Product, ProductVariant } from '@repo/shared';

interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, selectedVariant }) => {
  const formattedPrice = parseFloat(selectedVariant?.price || product.price).toFixed(2);
  const fabricDetails = product.description?.includes('GSM')
    ? product.description
    : '275 GSM JERSEY';

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl font-medium mb-1">{product.name.toUpperCase()}</h1>

      <div className="mb-4">
        <p className="text-sm text-gray-500 tracking-wide uppercase">
          {fabricDetails}
        </p>
      </div>

      <div className="mb-8">
        <p className="text-xl">${formattedPrice}</p>
      </div>
    </div>
  );
};
