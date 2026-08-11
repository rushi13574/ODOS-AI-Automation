"use client";
import React from 'react';
import { useToday } from '../../hooks/useToday';
import { TodayHeader } from './TodayHeader';
import { TaskList } from './TaskList';
import { LearningContext } from './LearningContext';
import { Loader2 } from 'lucide-react';

export function TodayView({ roadmapId }: { roadmapId?: string }) {
  const { 
    todayTasks, 
    overdueTasks, 
    metrics, 
    objectives, 
    resources, 
    loading, 
    error,
    startTask,
    pauseTask,
    completeTask,
    updatePartialProgress
  } = useToday(roadmapId);

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
        <h2 className="text-lg font-bold mb-2">Could not load today's plan</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-8">
      <TodayHeader metrics={metrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <TaskList 
            todayTasks={todayTasks} 
            overdueTasks={overdueTasks} 
            onStart={startTask}
            onPause={pauseTask}
            onComplete={completeTask}
            onPartialComplete={updatePartialProgress}
          />
        </div>
        <div className="lg:col-span-1">
          <LearningContext 
            objectives={objectives} 
            resources={resources} 
          />
        </div>
      </div>
    </div>
  );
}

