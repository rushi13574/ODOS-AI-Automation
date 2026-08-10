import * as React from 'react';
import { cn } from '../utils';

export interface DataTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  headers: string[];
}

export const DataTable = React.forwardRef<HTMLTableElement, DataTableProps>(
  ({ className, headers, children, ...props }, ref) => {
    return (
      <div className="w-full overflow-x-auto rounded-2xl border border-border bg-card/45 shadow-sm">
        <table
          ref={ref}
          className={cn('w-full border-collapse text-left text-sm text-foreground', className)}
          {...props}
        >
          <thead className="bg-secondary/40 border-b border-border/80 text-xs font-bold uppercase tracking-wider text-muted-foreground select-none">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="px-6 py-4 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 hover:bg-secondary/5 transition-colors">
            {children}
          </tbody>
        </table>
      </div>
    );
  }
);

DataTable.displayName = 'DataTable';
