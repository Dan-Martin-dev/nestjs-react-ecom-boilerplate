import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const ErrorState: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <h2 className="text-lg font-medium text-red-800 mb-2">Product Not Found</h2>
        <p className="text-red-700">We couldn't find the product you're looking for.</p>
        <Link
          to="/products"
          className="mt-4 inline-flex items-center text-sm font-medium text-red-700 hover:text-red-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Return to Products
        </Link>
      </div>
    </div>
  );
};
