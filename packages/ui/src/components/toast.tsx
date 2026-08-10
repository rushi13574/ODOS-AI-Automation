import * as React from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../utils';

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description: string;
  type?: 'success' | 'warning' | 'error' | 'info';
  onClose?: () => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, title, description, type = 'info', onClose, ...props }, ref) => {
    const icons = {
      success: <CheckCircle className="h-5 w-5 text-success" />,
      warning: <AlertTriangle className="h-5 w-5 text-warning" />,
      error: <AlertCircle className="h-5 w-5 text-destructive" />,
      info: <Info className="h-5 w-5 text-info" />,
    };

    const borders = {
      success: 'border-l-success',
      warning: 'border-l-warning',
      error: 'border-l-destructive',
      info: 'border-l-info',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex w-full max-w-md items-start gap-4 rounded-xl border border-border/80 border-l-4 bg-card/95 p-4 shadow-glow backdrop-blur-md animate-fade-in',
          borders[type],
          className
        )}
        role="alert"
        {...props}
      >
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1 space-y-1">
          {title ? <p className="text-sm font-bold text-foreground">{title}</p> : null}
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        </div>
        {onClose ? (
          <button
            onClick={onClose}
            type="button"
            className="flex-shrink-0 rounded-lg p-1 text-muted-foreground hover:bg-secondary/60 hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        ) : null}
      </div>
    );
  }
);

Toast.displayName = 'Toast';
