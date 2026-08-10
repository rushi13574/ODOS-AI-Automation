import * as React from 'react';
import { cn } from '../utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'info' | 'destructive';
}

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => {
  const baseStyles =
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

  const variants = {
    default: 'border-transparent bg-primary text-primary-foreground',
    secondary: 'border-transparent bg-secondary text-secondary-foreground',
    success: 'border-transparent bg-success/10 text-success border border-success/20',
    warning: 'border-transparent bg-warning/10 text-warning border border-warning/20',
    info: 'border-transparent bg-info/10 text-info border border-info/20',
    destructive: 'border-transparent bg-destructive/10 text-destructive border border-destructive/20',
  };

  return <span className={cn(baseStyles, variants[variant], className)} {...props} />;
};

Badge.displayName = 'Badge';
