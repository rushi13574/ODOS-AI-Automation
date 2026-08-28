"use client";
import React, { useMemo } from 'react';
import { useLearningGoals } from '@/hooks/useLearningGoals';
import { useRoadmap } from '@/hooks/useRoadmap';
import { useResources } from '@/hooks/useResources';
import { ResourceCard } from './ResourceCard';
import { Button } from '@/components/ui/Button';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function CurrentLearningContext() {
  const { goals, loading: goalsLoading } = useLearningGoals();
  
  const activeGoal = useMemo(() => {
    return goals?.find((g: any) => g.status !== 'completed' && g.status !== 'abandoned');
  }, [goals]);

  const { roadmap, loading: roadmapLoading } = useRoadmap(activeGoal?.id);

  const currentTask = useMemo(() => {
    if (!roadmap || !roadmap.modules) return null;
    
    let firstPendingTask = null;
    let activeTask = null;

    for (const m of roadmap.modules) {
      for (const s of m.skills) {
        if (s.progressStatus === 'in_progress') {
          if (!activeTask) activeTask = s;
        } else if (s.progressStatus === 'pending') {
          if (!firstPendingTask) firstPendingTask = s;
        }
      }
    }
    return activeTask || firstPendingTask;
  }, [roadmap]);

  const { resources, loading: resourcesLoading } = useResources(currentTask?.id);

  if (goalsLoading || roadmapLoading) {
    return (
      <div className="py-12 flex justify-center">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  if (!activeGoal) {
    return null; // Don't show if no active goal
  }

  return (
    <div className="mb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="text-sm font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2">
            Currently Learning
          </h2>
          <h3 className="text-2xl font-extrabold text-[var(--color-foreground)] tracking-tight">
            {activeGoal.skillName}
          </h3>
          {currentTask && (
            <p className="text-[var(--color-muted-foreground)] mt-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> 
              Current Task: <span className="font-semibold">{currentTask.title}</span>
            </p>
          )}
        </div>
        
        {currentTask && (
          <Link href={`/skill/${activeGoal?.id}/learn/${currentTask.id}`}>
            <Button>
              Continue Learning <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        )}
      </div>

      <div className="bg-gray-50/50 rounded-2xl p-6 md:p-8 border border-[var(--color-border-light)]">
        <h4 className="text-sm font-bold text-[var(--color-foreground)] uppercase tracking-wider mb-6">
          Recommended Resources for Current Task
        </h4>
        
        {resourcesLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-6 h-6 text-[var(--color-muted-foreground)] animate-spin" />
          </div>
        ) : resources && resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-[var(--color-muted-foreground)]">
              No recommended resources found for this specific task.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
