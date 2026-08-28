"use client";
import React, { useState } from 'react';
import { useCalendar, CalendarTask } from '../../hooks/useCalendar';
import { CalendarSummary } from './CalendarSummary';
import { CalendarGrid } from './CalendarGrid';
import { TimelineView } from './TimelineView';
import { ComparisonTable } from './ComparisonTable';
import { TaskDetailView } from './TaskDetailView';
import { Loader2, LayoutGrid, List, Columns, AlertCircle, Calendar } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';

export function CalendarLayout({ roadmapId }: { roadmapId?: string }) {
  const { data, loading, error } = useCalendar(roadmapId);
  
  const [mode, setMode] = useState<'current' | 'baseline' | 'comparison'>('current');
  const [view, setView] = useState<'grid' | 'timeline'>('timeline');
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);

  if (!roadmapId) {
    return (
      <EmptyState
        icon={<Calendar className="w-8 h-8 text-gray-400" />}
        title="Your learning schedule hasn't been prepared yet."
        description="We organize your learning goals into an adaptive calendar. Start a journey to see it here."
      />
    );
  }

  if (loading && !data) {
    return <LoadingState message="Loading your schedule..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-8 h-8 text-red-500" />}
        title="Could not load calendar"
        description={error.message || "An unexpected error occurred."}
      />
    );
  }

  if (data && data.baseline.length === 0 && data.current.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="w-8 h-8 text-gray-400" />}
        title="Your learning schedule hasn't been prepared yet."
        description="We're organizing your skills into a daily schedule."
      />
    );
  }

  if (!data) return null;

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning Schedule</h1>
          <p className="text-gray-500">Your focused learning plan, ordered by the days that matter.</p>
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
            learningGoalId={roadmapId}
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

