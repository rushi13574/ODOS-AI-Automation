import * as React from 'react';
import { cn } from '../utils';

// ============================================
// Sidebar Component
// ============================================
export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  logo?: React.ReactNode;
  footer?: React.ReactNode;
}

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ className, logo, footer, children, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(
          'flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar p-4 select-none',
          className
        )}
        {...props}
      >
        {logo ? (
          <div className="flex h-12 items-center px-3 pb-4 border-b border-sidebar-border mb-4">
            {logo}
          </div>
        ) : null}
        <nav className="flex-1 space-y-1 overflow-y-auto">{children}</nav>
        {footer ? (
          <div className="border-t border-sidebar-border pt-4 mt-auto">
            {footer}
          </div>
        ) : null}
      </aside>
    );
  }
);
Sidebar.displayName = 'Sidebar';

// ============================================
// Navigation Header Component
// ============================================
export interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
  brand?: React.ReactNode;
  actions?: React.ReactNode;
}

export const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  ({ className, brand, actions, children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          'flex h-16 w-full items-center justify-between border-b border-border bg-card/65 px-6 backdrop-blur-md sticky top-0 z-40',
          className
        )}
        {...props}
      >
        {brand ? <div className="flex items-center">{brand}</div> : null}
        <nav className="flex items-center gap-6">{children}</nav>
        {actions ? <div className="flex items-center gap-4">{actions}</div> : null}
      </header>
    );
  }
);
Navigation.displayName = 'Navigation';

// ============================================
// PageHeader Component
// ============================================
export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, description, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/40 mb-6',
          className
        )}
        {...props}
      >
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
          {description ? (
            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
      </div>
    );
  }
);
PageHeader.displayName = 'PageHeader';
