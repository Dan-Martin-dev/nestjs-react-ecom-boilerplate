import React from 'react';
import { AlertCircle } from 'lucide-react';

interface DashboardErrorProps {
  message?: string;
  details?: string;
  onRetry?: () => void;
}

/**
 * Consistent error state component for dashboard pages
 */
export const DashboardError: React.FC<DashboardErrorProps> = ({
  message = 'Something went wrong',
  details,
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-12 px-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center mb-4">
          <AlertCircle className="text-red-500 h-6 w-6 mr-2" />
          <h3 className="text-lg font-medium text-red-800">{message}</h3>
        </div>
        
        {details && (
          <p className="text-sm text-red-700 mb-4">{details}</p>
        )}
        
        {onRetry && (
          <button 
            onClick={onRetry}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardError;
