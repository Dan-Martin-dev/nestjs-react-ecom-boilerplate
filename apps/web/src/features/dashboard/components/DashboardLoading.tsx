import React from 'react';
import { Loader2 } from 'lucide-react';

interface DashboardLoadingProps {
  message?: string;
}

export const DashboardLoading: React.FC<DashboardLoadingProps> = ({ 
  message = 'Loading data...' 
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-12">
      <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
      <p className="text-muted-foreground font-medium">{message}</p>
    </div>
  );
};

export default DashboardLoading;
