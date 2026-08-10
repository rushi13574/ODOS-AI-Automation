import * as React from 'react';
import { cn } from '../utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton = ({ className, variant = 'rect', ...props }: SkeletonProps) => {
  const variants = {
    text: 'h-4 w-full rounded-md',
    rect: 'h-24 w-full rounded-xl',
    circle: 'h-12 w-12 rounded-full',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-secondary/80 border border-border/10',
        variants[variant],
        className
      )}
      {...props}
    />
  );
};

Skeleton.displayName = 'Skeleton';
