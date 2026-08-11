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

export function TaskList({ todayTasks, overdueTasks, onStart, onPause, onComplete, onPartialComplete }: TaskListProps) {
  return (
    <div className="space-y-8">
      {overdueTasks.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            Overdue Tasks
            <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{overdueTasks.length}</span>
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
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
          Today's Plan
          <span className="ml-2 text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{todayTasks.length}</span>
        </h2>
        
        {todayTasks.length === 0 ? (
          <div className="bg-gray-50 rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
            No tasks scheduled for today. Take a break or jump ahead in the calendar!
          </div>
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

