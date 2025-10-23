import React from 'react';
import type { Product, ProductVariant } from '@repo/shared';

interface ProductInfoProps {
  product: Product;
  selectedVariant: ProductVariant | null;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, selectedVariant }) => {
  const formattedPrice = parseFloat(selectedVariant?.price || product.price).toFixed(2);
  const fabricDetails = product.description || '';

  return (
    <div>
      <h1 className="font-antarctican font-[500] mb-1 text-[21.6px] md:text-[28.8px]">
        {product.name.toUpperCase()}
      </h1>

      <div className="mb-4 max-w-[40%]">
        <p className="font-antarctican font-[200] text-gray-700 text-[14.4px] md:text-[14.4px]">
          {fabricDetails}
        </p>
      </div>

      <div className="mb-8">
        <p className="text-xl">${formattedPrice}</p>
      </div>
    </div>
  );
};
