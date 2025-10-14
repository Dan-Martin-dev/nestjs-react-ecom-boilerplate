import React from 'react';
import { Link } from 'react-router-dom';

interface BreadcrumbProps {
  productName: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ productName }) => {
  return (
    <div className="border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <nav className="flex py-4 text-sm uppercase tracking-wide">
          <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/products" className="text-gray-500 hover:text-gray-700">Products</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-900 font-medium">{productName}</span>
        </nav>
      </div>
    </div>
  );
};
