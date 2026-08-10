import * as React from 'react';
import { RefreshCw, AlertCircle, Inbox, Loader2 } from 'lucide-react';
import { Button } from './button';
import { cn } from '../utils';

// ============================================
// EmptyState Component
// ============================================
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, title, description, actionLabel, onAction, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center p-8 glass rounded-2xl max-w-md mx-auto space-y-4 border border-dashed border-border',
          className
        )}
        {...props}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/50 text-muted-foreground">
          {icon || <Inbox className="h-6 w-6" />}
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground leading-normal">{description}</p>
        </div>
        {actionLabel && onAction ? (
          <Button onClick={onAction} size="sm" variant="outline" className="mt-2">
            {actionLabel}
          </Button>
        ) : null}
      </div>
    );
  }
);
EmptyState.displayName = 'EmptyState';

// ============================================
// ErrorState Component
// ============================================
export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({ className, message, onRetry, retryLabel = 'Retry', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center text-center p-6 border border-destructive/20 bg-destructive/5 rounded-2xl max-w-md mx-auto space-y-3',
          className
        )}
        {...props}
      >
        <AlertCircle className="h-8 w-8 text-destructive animate-bounce" />
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground">Something went wrong</h3>
          <p className="text-xs text-muted-foreground leading-normal">{message}</p>
        </div>
        {onRetry ? (
          <Button onClick={onRetry} size="sm" variant="destructive" className="mt-1">
            <RefreshCw className="h-3 w-3 mr-1.5" />
            {retryLabel}
          </Button>
        ) : null}
      </div>
    );
  }
);
ErrorState.displayName = 'ErrorState';

// ============================================
// LoadingState Component
// ============================================
export interface LoadingStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message?: string;
}

export const LoadingState = React.forwardRef<HTMLDivElement, LoadingStateProps>(
  ({ className, message = 'Loading contents...', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center p-12 space-y-3', className)}
        {...props}
      >
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-xs font-semibold text-muted-foreground animate-pulse">{message}</p>
      </div>
    );
  }
);
LoadingState.displayName = 'LoadingState';
