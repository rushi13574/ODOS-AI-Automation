import * as React from 'react';
import { Play, FileText, CheckCircle2, Circle } from 'lucide-react';
import { Card } from './card';
import { Badge } from './badge';
import { cn } from '../utils';

// ============================================
// StatCard Component
// ============================================
export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
}

export const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  ({ className, title, value, trend, trendType = 'neutral', icon, ...props }, ref) => {
    const trendColors = {
      positive: 'text-success bg-success/5 border-success/10',
      negative: 'text-destructive bg-destructive/5 border-destructive/10',
      neutral: 'text-muted-foreground bg-secondary/30 border-border/10',
    };

    return (
      <Card
        ref={ref}
        hoverable
        className={cn('flex flex-col justify-between gap-4', className)}
        {...props}
      >
        <div className="flex items-start justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {title}
          </span>
          {icon ? (
            <div className="text-primary h-5 w-5 flex items-center justify-center">
              {icon}
            </div>
          ) : null}
        </div>

        <div className="space-y-1">
          <p className="text-3xl font-extrabold text-foreground tracking-tight">{value}</p>
          {trend ? (
            <span
              className={cn(
                'inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-bold',
                trendColors[trendType]
              )}
            >
              {trend}
            </span>
          ) : null}
        </div>
      </Card>
    );
  }
);
StatCard.displayName = 'StatCard';

// ============================================
// TaskCard Component
// ============================================
export interface TaskCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  duration?: string;
  completed?: boolean;
  onCompleteToggle?: () => void;
  actions?: React.ReactNode;
}

export const TaskCard = React.forwardRef<HTMLDivElement, TaskCardProps>(
  ({ className, title, description, duration, completed, onCompleteToggle, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'glass rounded-xl p-5 border-l-4 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-glow',
          completed ? 'border-l-success opacity-80' : 'border-l-primary',
          className
        )}
        {...props}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {onCompleteToggle ? (
            <button
              onClick={onCompleteToggle}
              type="button"
              className="mt-1 flex-shrink-0 text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              {completed ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </button>
          ) : null}

          <div className="space-y-1 min-w-0">
            <h3
              className={cn(
                'text-sm font-bold text-foreground truncate',
                completed ? 'line-through text-muted-foreground' : ''
              )}
            >
              {title}
            </h3>
            {description ? (
              <p className="text-xs text-muted-foreground leading-normal line-clamp-2">{description}</p>
            ) : null}
            {duration ? (
              <div className="flex items-center text-[10px] font-bold text-muted-foreground mt-2">
                <span>⏱️ {duration}</span>
              </div>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex flex-shrink-0 items-center gap-2 sm:self-center self-end">
            {actions}
          </div>
        ) : null}
      </div>
    );
  }
);
TaskCard.displayName = 'TaskCard';

// ============================================
// ResourceCard Component
// ============================================
export interface ResourceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  type: 'video' | 'documentation';
  url: string;
}

export const ResourceCard = React.forwardRef<HTMLDivElement, ResourceCardProps>(
  ({ className, title, description, type, url, ...props }, ref) => {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block no-underline"
      >
        <Card
          ref={ref}
          hoverable
          className={cn(
            'flex flex-col justify-between gap-4 border border-border/60 p-5 h-full hover:bg-secondary/15',
            className
          )}
          {...props}
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge variant={type === 'video' ? 'info' : 'secondary'}>
                {type === 'video' ? 'YouTube' : 'Documentation'}
              </Badge>
              {type === 'video' ? (
                <Play className="h-4 w-4 text-info" />
              ) : (
                <FileText className="h-4 w-4 text-muted-foreground" />
              )}
            </div>

            <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-2">
              {title}
            </h3>
            {description ? (
              <p className="text-xs text-muted-foreground leading-normal line-clamp-3">
                {description}
              </p>
            ) : null}
          </div>

          <div className="text-[10px] font-bold text-primary hover:underline pt-2 border-t border-border/40 select-none">
            View Material →
          </div>
        </Card>
      </a>
    );
  }
);
ResourceCard.displayName = 'ResourceCard';
