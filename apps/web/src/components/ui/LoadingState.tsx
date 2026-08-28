import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

export function LoadingState({ message = 'Loading...', className }: LoadingStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center h-full min-h-[200px]',
        className
      )}
    >
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mb-4"></div>
      <p className="text-sm text-[var(--color-muted-foreground)] animate-pulse">
        {message}
      </p>
    </div>
  );
}
