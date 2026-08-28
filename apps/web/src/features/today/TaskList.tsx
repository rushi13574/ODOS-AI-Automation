"use client";
import React from 'react';
import { Task } from '../../hooks/useToday';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  todayTasks: Task[];
  overdueTasks: Task[];
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onComplete: (id: string) => void;
  onPartialComplete: (id: string, mins: number) => void;
}

import { EmptyState } from '@/components/ui/EmptyState';
import { CalendarDays } from 'lucide-react';

export function TaskList({ todayTasks, overdueTasks, onStart, onPause, onComplete, onPartialComplete }: TaskListProps) {
  return (
    <div className="space-y-8">
      {overdueTasks.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-4 flex items-center">
            <span className="w-2 h-2 rounded-full bg-[var(--color-destructive)] mr-2 shadow-sm"></span>
            Overdue Tasks
            <span className="ml-3 text-sm font-medium text-[var(--color-muted-foreground)] bg-[var(--color-secondary)] px-2.5 py-0.5 rounded-full">{overdueTasks.length}</span>
          </h2>
          <div className="space-y-4">
            {overdueTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStart={onStart}
                onPause={onPause}
                onComplete={onComplete}
                onPartialComplete={onPartialComplete}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-4 flex items-center">
          <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] mr-2 shadow-sm"></span>
          Today's Plan
          <span className="ml-3 text-sm font-medium text-[var(--color-muted-foreground)] bg-[var(--color-secondary)] px-2.5 py-0.5 rounded-full">{todayTasks.length}</span>
        </h2>
        
        {todayTasks.length === 0 ? (
          <EmptyState 
            icon={<CalendarDays />}
            title="All caught up!"
            description="No tasks scheduled for today. Take a break or jump ahead in the calendar to start tomorrow's tasks early."
          />
        ) : (
          <div className="space-y-4">
            {todayTasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onStart={onStart}
                onPause={onPause}
                onComplete={onComplete}
                onPartialComplete={onPartialComplete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

