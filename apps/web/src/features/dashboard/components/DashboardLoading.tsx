import React from 'react';

interface DashboardLoadingProps {
  message?: string;
}

/**
 * Consistent loading state component for dashboard pages
 */
export const DashboardLoading: React.FC<DashboardLoadingProps> = ({ 
  message = 'Loading data...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-4"></div>
      <p className="text-gray-600 font-medium">{message}</p>
    </div>
  );
};

export default DashboardLoading;
