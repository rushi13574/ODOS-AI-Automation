"use client";
import React from 'react';
import { CalendarTask } from '../../hooks/useCalendar';

interface Props {
  tasks: CalendarTask[];
  mode: 'baseline' | 'current';
  onSelectTask: (task: CalendarTask) => void;
}

export function CalendarGrid({ tasks, mode, onSelectTask }: Props) {
  // Very simplistic grid for demonstration
  // In a real app, this would use CSS Grid with accurate day alignment (e.g. starting on Monday)
  
  // Group by date
  const grouped = tasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {} as Record<string, CalendarTask[]>);

  const dates = Object.keys(grouped).sort();
  if (dates.length === 0) return <div>No tasks to display.</div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
      {dates.map(date => {
        const dayTasks = grouped[date];
        const isBaseline = mode === 'baseline';
        return (
          <div key={date} className={`border rounded-lg p-3 min-h-[120px] ${isBaseline ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-100 shadow-sm'}`}>
            <div className="text-xs font-bold text-gray-500 mb-2 border-b pb-1">{date}</div>
            <div className="space-y-2">
              {dayTasks.map(task => (
                <button 
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className={`w-full text-left text-xs p-2 rounded cursor-pointer transition-colors hover:brightness-95 ${
                    isBaseline 
                      ? 'bg-gray-200 text-gray-700' 
                      : task.status === 'completed' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  <div className="font-semibold truncate">{task.title}</div>
                  <div className="text-[10px] opacity-80 truncate">{task.module}</div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

