import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="h-64 w-full max-w-md bg-gray-200 rounded"></div>
        <div className="h-4 w-full max-w-md bg-gray-200 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};
