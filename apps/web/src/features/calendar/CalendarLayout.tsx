"use client";
import React, { useState } from 'react';
import { useCalendar, CalendarTask } from '../../hooks/useCalendar';
import { CalendarSummary } from './CalendarSummary';
import { CalendarGrid } from './CalendarGrid';
import { TimelineView } from './TimelineView';
import { ComparisonTable } from './ComparisonTable';
import { TaskDetailView } from './TaskDetailView';
import { Loader2, LayoutGrid, List, Columns } from 'lucide-react';

export function CalendarLayout({ roadmapId }: { roadmapId?: string }) {
  const { data, loading, error } = useCalendar(roadmapId);
  
  const [mode, setMode] = useState<'current' | 'baseline' | 'comparison'>('current');
  const [view, setView] = useState<'grid' | 'timeline'>('grid');
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
        <h2 className="text-lg font-bold mb-2">Could not load calendar</h2>
        <p>{error?.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Schedule</h1>
          <p className="text-gray-500">Track and compare your adaptive learning calendar.</p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setMode('baseline')} 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'baseline' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Baseline
            </button>
            <button 
              onClick={() => setMode('current')} 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'current' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Current
            </button>
            <button 
              onClick={() => setMode('comparison')} 
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'comparison' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Comparison
            </button>
          </div>

          {mode !== 'comparison' && (
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button 
                onClick={() => setView('grid')} 
                className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setView('timeline')} 
                className={`p-2 rounded-md transition-colors ${view === 'timeline' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      <CalendarSummary metrics={data.summary} />

      <div className="mt-8">
        {mode === 'comparison' ? (
          <ComparisonTable comparison={data.comparison} />
        ) : view === 'grid' ? (
          <CalendarGrid 
            tasks={mode === 'baseline' ? data.baseline : data.current} 
            mode={mode} 
            onSelectTask={setSelectedTask}
          />
        ) : (
          <TimelineView 
            tasks={mode === 'baseline' ? data.baseline : data.current} 
            mode={mode} 
            onSelectTask={setSelectedTask}
          />
        )}
      </div>

      <TaskDetailView 
        task={selectedTask} 
        onClose={() => setSelectedTask(null)} 
      />
    </div>
  );
}

