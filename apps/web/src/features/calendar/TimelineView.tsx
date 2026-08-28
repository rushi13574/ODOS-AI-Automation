"use client";
import React from 'react';
import Link from 'next/link';
import { CalendarTask } from '../../hooks/useCalendar';
import { Circle, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { format } from 'date-fns';
import { scheduleDayToLocalDate, todayScheduleDay } from '@/lib/schedule-date';

interface Props {
  tasks: CalendarTask[];
  mode: 'baseline' | 'current';
  onSelectTask: (task: CalendarTask) => void;
  learningGoalId: string;
}

export function TimelineView({ tasks, mode, onSelectTask, learningGoalId }: Props) {
  const isBaseline = mode === 'baseline';

  const formatTaskDate = (dateString: string) => {
    const date = scheduleDayToLocalDate(dateString);
    return date ? format(date, 'EEE, MMM d').toUpperCase() : dateString;
  };

  const isToday = (dateString: string) => {
    return dateString === todayScheduleDay();
  };

  const orderedTasks = [...tasks].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="relative border-l-2 border-[var(--color-border-light)] ml-4 space-y-10 py-4">
      {orderedTasks.map((task) => {
        const isDone = task.status === 'completed' && !isBaseline;
        const isOverdue = task.status === 'overdue' && !isBaseline;
        const todayMark = isToday(task.date) ? 'TODAY • ' : '';

        return (
          <div key={task.id} className="relative pl-8 group">
            <span className="absolute -left-[11px] top-1.5 bg-[var(--color-background)]">
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
              ) : isOverdue ? (
                <AlertCircle className="w-5 h-5 text-amber-600" />
              ) : isToday(task.date) ? (
                <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] border-4 border-[var(--color-background)] shadow-sm ring-1 ring-[var(--color-primary)]"></div>
              ) : (
                <Circle className={`w-5 h-5 ${isBaseline ? 'text-[var(--color-muted-foreground)]' : 'text-[var(--color-border-light)] fill-[var(--color-surface)]'}`} />
              )}
            </span>
            
            <div className={`mb-2 text-xs font-bold tracking-widest ${isToday(task.date) ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'}`}>
              {isOverdue ? 'CARRIED FORWARD • ' : todayMark}{formatTaskDate(task.date)}
            </div>
            
            <div className={`w-full text-left py-4 sm:py-6 transition-all`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
                <div>
                  <div className="text-sm font-medium text-[var(--color-muted-foreground)] mb-1">
                    {task.module}
                  </div>
                  <h4 className={`text-xl font-bold tracking-tight mb-2 ${isDone ? 'text-[var(--color-muted-foreground)] line-through decoration-[var(--color-border-light)]' : 'text-[var(--color-foreground)]'}`}>
                    {task.title}
                  </h4>
                  <div className="text-sm font-medium text-[var(--color-muted-foreground)]">
                    Duration: {task.estimatedMinutes} min
                  </div>
                  {isOverdue && <div className="mt-2 text-xs font-bold uppercase tracking-wider text-amber-700">Overdue — prioritized today</div>}
                </div>

                {!isBaseline && (
                  <div className="shrink-0 mt-2 sm:mt-0">
                    <Link href={`/skill/${learningGoalId}/learn/${task.id}`}>
                      {isDone ? (
                        <Button variant="ghost" size="sm" className="font-medium text-[var(--color-primary)] px-0 hover:bg-transparent">
                          Review <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      ) : (
                        <Button variant={isToday(task.date) ? 'default' : 'ghost'} size="sm" className={`font-bold rounded-full ${isToday(task.date) ? 'px-8 shadow-sm' : 'px-0 hover:bg-transparent text-[var(--color-primary)]'}`}>
                          Open Lesson {isToday(task.date) && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                      )}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
