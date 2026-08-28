"use client";
import React, { useMemo } from 'react';
import { useRoadmap } from '@/hooks/useRoadmap';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader2, ArrowRight, PlayCircle, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';

interface ActiveJourneyCardProps {
  goal: any;
}

export function ActiveJourneyCard({ goal }: ActiveJourneyCardProps) {
  const { roadmap, loading } = useRoadmap(goal.id);

  const { totalNodes, completedNodes, currentTask, progressPercent } = useMemo(() => {
    if (!roadmap || !roadmap.modules) {
      return { totalNodes: 0, completedNodes: 0, currentTask: null, progressPercent: 0 };
    }

    let total = 0;
    let completed = 0;
    let firstPendingTask = null;
    let activeTask = null;

    for (const m of roadmap.modules) {
      for (const s of m.skills) {
        total++;
        if (s.progressStatus === 'completed') {
          completed++;
        } else if (s.progressStatus === 'in_progress') {
          if (!activeTask) activeTask = s;
        } else if (s.progressStatus === 'pending') {
          if (!firstPendingTask) firstPendingTask = s;
        }
      }
    }

    const currentTask = activeTask || firstPendingTask;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { totalNodes: total, completedNodes: completed, currentTask, progressPercent };
  }, [roadmap]);

  if (loading) {
    return (
      <Card className="border-[var(--color-border-light)] shadow-sm animate-pulse">
        <CardContent className="p-8 flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-6 h-6 text-[var(--color-muted-foreground)] animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!roadmap) {
    return null; // Or some fallback
  }

  return (
    <div className="mb-12">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">
                  Learning Journey
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white text-[var(--color-muted-foreground)] border border-[var(--color-border-light)]">
                  {progressPercent}% complete
                </span>
              </div>
              <h3 className="text-3xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-2">
                {goal.skillName}
              </h3>
              <p className="text-sm text-[var(--color-muted-foreground)] max-w-2xl">
                Target: {goal.targetLevel}
              </p>
            </div>
            
            {currentTask && (
              <div className="flex flex-col items-start md:items-end">
                <p className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider mb-2">
                  Current Skill
                </p>
                <div className="font-semibold text-[var(--color-foreground)] mb-4 text-left md:text-right max-w-xs truncate">
                  {currentTask.title}
                </div>
                <Link href={`/skill/${goal.id}/learn/${currentTask.id}`}>
                  <Button variant="default" className="rounded-full px-8 font-bold">
                    Continue Learning <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

        {/* Conceptual Roadmap Visualization Preview */}
        <div className="pt-6 border-t border-[var(--color-border-light)]">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-[var(--color-foreground)]">Journey Overview</h4>
            <span className="text-sm text-[var(--color-muted-foreground)]">
              {completedNodes} / {totalNodes} learning nodes
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roadmap.modules.slice(0, 3).map((m: any, idx: number) => {
              const allCompleted = m.skills.every((s: any) => s.progressStatus === 'completed');
              const isActiveModule = m.skills.some((s: any) => s.id === currentTask?.id);

              return (
                <div key={m.id} className="space-y-3">
                  <h5 className={`text-xs font-bold uppercase tracking-wider line-clamp-1 ${isActiveModule ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'}`}>
                    {idx + 1}. {m.title}
                  </h5>
                  <div className="space-y-2">
                    {m.skills.slice(0, 4).map((s: any) => {
                      const isCompleted = s.progressStatus === 'completed';
                      const isActive = s.id === currentTask?.id;
                      
                      return (
                        <div key={s.id} className="flex items-start">
                          <div className="mt-0.5 mr-2 flex-shrink-0">
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-[var(--color-success)]" />
                            ) : isActive ? (
                              <Circle className="w-4 h-4 text-[var(--color-primary)] fill-[var(--color-primary)]" />
                            ) : (
                              <Circle className={`w-4 h-4 text-[var(--color-border-light)]`} />
                            )}
                          </div>
                          <span className={`text-sm line-clamp-1 ${isActive ? 'font-semibold text-[var(--color-foreground)]' : isCompleted ? 'text-[var(--color-muted-foreground)] line-through decoration-gray-300' : 'text-[var(--color-muted-foreground)]'}`}>
                            {s.title}
                          </span>
                        </div>
                      );
                    })}
                    {m.skills.length > 4 && (
                      <div className="text-xs text-[var(--color-muted-foreground)] pl-6">
                        + {m.skills.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {roadmap.modules.length > 3 && (
            <div className="flex justify-end mt-6">
              <Link href={`/skill/${goal.id}/roadmap`}>
                <Button className="font-semibold rounded-full shadow-sm group bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white">
                  View Full Roadmap
                </Button>
              </Link>
            </div>
          )}
        </div>
    </div>
  );
}
