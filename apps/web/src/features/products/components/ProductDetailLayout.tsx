import React from 'react';
import { Breadcrumb, /* ProductRecommendations */ } from './index';

interface ProductDetailLayoutProps {
  productName: string;
  children: React.ReactNode;
}

export const ProductDetailLayout: React.FC<ProductDetailLayoutProps> = ({
  productName,
  children,
}) => {
  return (
    <div className="bg-gray-50 min-h-screen auth-font-inco">
      <Breadcrumb productName={productName} />
      {children}
      {/* <ProductRecommendations /> */}
    </div>
  );
};
