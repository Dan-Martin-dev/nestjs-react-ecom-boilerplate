import React from 'react';
import type { ReactNode } from 'react';
import { SearchX } from 'lucide-react';

interface DashboardEmptyStateProps {
  title: string;
  message: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Consistent empty state component for dashboard pages
 */
export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  title,
  message,
  icon = <SearchX className="h-12 w-12 text-gray-400" />,
  action
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-12 px-4 text-center">
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md w-full">
        <div className="flex justify-center mb-4">
          {icon}
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        
        {action && (
          <button 
            onClick={action.onClick}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardEmptyState;
