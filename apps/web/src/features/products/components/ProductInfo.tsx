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
      <h1 
        className="font-medium mb-1" 
        style={{ 
          fontFamily: 'Antarctican Mono', 
          fontSize: '21.6px', 
          fontWeight: 500, 
          fontStyle: 'normal' 
        }}
      >
        {product.name.toUpperCase()}
      </h1>

      <div className="mb-4">
        <p 
          className="tracking-wide uppercase" 
          style={{ 
            fontFamily: 'Antarctican Mono', 
            fontSize: '14.4px', 
            fontWeight: 400, 
            fontStyle: 'normal', 
            color: '#6b7280' 
          }}
        >
          {fabricDetails}
        </p>
      </div>

      <div className="mb-8">
        <p className="text-xl">${formattedPrice}</p>
      </div>
    </div>
  );
};
