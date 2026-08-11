"use client";
import React from 'react';
import { useProgress } from '../../hooks/useProgress';
import { ProgressMetricsGrid } from './ProgressMetricsGrid';
import { CompletionDatesCard } from './CompletionDatesCard';
import { ChartsSection } from './ChartsSection';
import { AIProgressInterpreter } from './AIProgressInterpreter';
import { Loader2 } from 'lucide-react';

export function ProgressLayout({ roadmapId }: { roadmapId?: string }) {
  const { progress, loading, error } = useProgress(roadmapId || 'default');

  if (loading && !progress) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !progress) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
        <h2 className="text-lg font-bold mb-2">Could not load progress</h2>
        <p>{error?.message || 'Data unavailable'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Progress Dashboard</h1>
        <p className="text-gray-500">Analytics and milestones for your learning journey.</p>
      </div>

      <AIProgressInterpreter data={progress} />
      
      <ProgressMetricsGrid data={progress} />
      
      <CompletionDatesCard data={progress} />
      
      <ChartsSection data={progress} />

    </div>
  );
}

