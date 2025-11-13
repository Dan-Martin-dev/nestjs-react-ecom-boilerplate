import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

interface DashboardErrorProps {
  message?: string;
  details?: string;
  onRetry?: () => void;
}

export const DashboardError: React.FC<DashboardErrorProps> = ({
  message = 'Something went wrong',
  details,
  onRetry
}) => {
  return (
    <div className="flex flex-col items-center justify-center w-full py-12 px-4">
      <Card className="max-w-md w-full border-destructive">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="text-destructive h-6 w-6" />
            <CardTitle className="text-destructive font-monos">{message}</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {details && <p className="text-sm text-muted-foreground font-monos">{details}</p>}
          {onRetry && (
            <Button onClick={onRetry} variant="destructive">
              Try again
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardError;
