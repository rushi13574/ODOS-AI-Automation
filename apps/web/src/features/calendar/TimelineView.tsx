"use client";
import React from 'react';
import { CalendarTask } from '../../hooks/useCalendar';
import { Circle, CheckCircle2 } from 'lucide-react';

interface Props {
  tasks: CalendarTask[];
  mode: 'baseline' | 'current';
  onSelectTask: (task: CalendarTask) => void;
}

export function TimelineView({ tasks, mode, onSelectTask }: Props) {
  const isBaseline = mode === 'baseline';

  return (
    <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 py-4">
      {tasks.map((task, i) => (
        <div key={task.id} className="relative pl-6 group">
          <span className="absolute -left-[11px] top-1 bg-white">
            {task.status === 'completed' && !isBaseline ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            ) : (
              <Circle className={`w-5 h-5 ${isBaseline ? 'text-gray-400' : 'text-blue-500'}`} fill="white" />
            )}
          </span>
          
          <div className="mb-1 text-sm font-semibold text-gray-500">{task.date}</div>
          <button 
            onClick={() => onSelectTask(task)}
            className={`w-full text-left p-4 rounded-lg border shadow-sm transition-colors cursor-pointer hover:brightness-95 ${isBaseline ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-100'}`}
          >
            <h4 className={`text-lg font-bold ${task.status === 'completed' && !isBaseline ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
              {task.title}
            </h4>
            <p className="text-sm text-gray-600 mt-1">Module: {task.module}</p>
          </button>
        </div>
      ))}
    </div>
  );
}

