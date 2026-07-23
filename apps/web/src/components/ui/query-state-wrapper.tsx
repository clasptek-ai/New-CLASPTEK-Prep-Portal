import React from 'react';
import { Card } from '../../shared/ui/card/Card';
import { Button } from '../../shared/ui/button/Button';

interface QueryStateWrapperProps {
  isLoading: boolean;
  isError: boolean;
  error?: Error | null;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  loadingSkeleton?: React.ReactNode;
  children: React.ReactNode;
}

export function QueryStateWrapper({
  isLoading,
  isError,
  error,
  isEmpty,
  emptyMessage = 'No data available.',
  onRetry,
  loadingSkeleton,
  children,
}: QueryStateWrapperProps) {
  if (isLoading) {
    if (loadingSkeleton) {
      return <>{loadingSkeleton}</>;
    }
    return (
      <div className="flex flex-col items-center justify-center p-8 text-slate-400">
        <div className="w-8 h-8 border-2 border-blue-500 border-r-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-medium">Loading data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="border-red-500/30 bg-red-500/10 p-6 text-center">
        <h4 className="text-base font-bold text-red-400 m-0 mb-2">Unable to Load Data</h4>
        <p className="text-xs text-red-300 m-0 mb-4">
          {error?.message || 'An error occurred while fetching details.'}
        </p>
        {onRetry && (
          <Button variant="danger" size="sm" onClick={onRetry}>
            Retry Request
          </Button>
        )}
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className="p-8 text-center bg-slate-900 border-slate-800">
        <p className="text-sm text-slate-400 m-0">{emptyMessage}</p>
      </Card>
    );
  }

  return <>{children}</>;
}
