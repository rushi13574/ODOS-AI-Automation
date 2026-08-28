"use client";
import React, { useState } from 'react';
import { useTask } from '@/hooks/useTask';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { AlertCircle, ChevronLeft, CheckCircle2, ArrowRight, Clock, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { JourneySidebar } from './JourneySidebar';
import { LearningContent } from './LearningContent';
import { AiTutor } from './AiTutor';
import { useRouter } from 'next/navigation';
import { useSkillContext } from '@/hooks/useSkillContext';

interface LearningWorkspaceProps {
  taskId: string;
}

export function LearningWorkspace({ taskId }: LearningWorkspaceProps) {
  const { activeGoal } = useSkillContext();
  const { task, module, roadmap, loading, error, updateProgress } = useTask(taskId);
  const router = useRouter();

  // ── Date display ──
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dateFormatted = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) return <LoadingState message="Setting up your workspace..." />;
  
  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
        <EmptyState
          icon={<AlertCircle className="w-8 h-8 text-[var(--color-destructive)]" />}
          title="Task not found"
          description="We couldn't load this learning task. It may have been removed or the ID is incorrect."
        />
        <div className="mt-4">
          <Link href={`/skill/${activeGoal?.id}/roadmap`}><Button>Back to Roadmap</Button></Link>
        </div>
      </div>
    );
  }

  // Find next task
  let nextTask = null;
  if (roadmap) {
    let foundCurrent = false;
    for (const mod of roadmap.modules || []) {
      for (const skill of mod.skills || []) {
        if (foundCurrent) {
          nextTask = skill;
          break;
        }
        if (skill.id === taskId) {
          foundCurrent = true;
        }
      }
      if (nextTask) break;
    }
  }

  const handleMarkComplete = async () => {
    try {
      await updateProgress('completed', task.estimatedMinutes || 30);
      // Let user manually continue, or scroll to next task section
    } catch (err) {
      console.error(err);
    }
  };

  const handleNextTask = () => {
    if (nextTask) {
      router.push(`/skill/${activeGoal?.id}/learn/${nextTask.id}`);
    } else {
      router.push(`/skill/${activeGoal?.id}/roadmap`);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--color-background)]">
      {/* ═══════════════════════════════════════════════════════
          TOP NAVBAR — with date + session context
          ═══════════════════════════════════════════════════════ */}
      <header className="border-b border-[var(--color-border-light)] bg-[var(--color-surface)] z-20">
        {/* Session context bar */}
        <div className="h-8 bg-[var(--color-primary)]/5 border-b border-[var(--color-primary)]/10 flex items-center justify-center gap-3 text-xs font-bold tracking-wide text-[var(--color-primary)]">
          <CalendarIcon className="w-3 h-3" />
          <span>{dayName} · {dateFormatted}</span>
          <span className="text-[var(--color-primary)]/40">|</span>
          <span>{activeGoal?.skillName || 'Learning'}</span>
          <span className="text-[var(--color-primary)]/40">→</span>
          <span>{module?.title || 'Module'}</span>
          <span className="text-[var(--color-primary)]/40">→</span>
          <span className="truncate max-w-[200px]">{task.title}</span>
          <span className="text-[var(--color-primary)]/40">|</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {task.estimatedMinutes || 30} min
          </span>
        </div>

        {/* Main nav row */}
        <div className="h-14 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <Link href={`/skill/${activeGoal?.id}/main`} className="flex items-center text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors text-sm font-medium">
              <ChevronLeft className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="flex items-center text-sm">
              <span className="text-[var(--color-border-light)] mx-3 hidden sm:inline">|</span>
              <span className="text-[var(--color-muted-foreground)] truncate max-w-[150px] sm:max-w-[250px] hidden sm:inline">{module?.title || 'Learning'}</span>
              <span className="text-[var(--color-muted-foreground)] mx-2 hidden sm:inline">·</span>
              <span className="font-semibold text-[var(--color-foreground)] truncate max-w-[150px] sm:max-w-[250px]">{task.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {task.progressStatus === 'completed' ? (
               <div className="flex items-center text-sm font-medium text-[var(--color-success)] bg-[var(--color-success)]/10 px-3 py-1.5 rounded-full">
                 <CheckCircle2 className="w-4 h-4 mr-1.5" />
                 Completed
               </div>
            ) : (
              <Button size="sm" onClick={handleMarkComplete} className="font-medium rounded-full">
                <CheckCircle2 className="w-4 h-4 mr-1.5 hidden sm:inline" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════
          WORKSPACE AREA — 3-column layout
          ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col lg:grid lg:grid-cols-[240px_1fr_340px] overflow-y-auto lg:overflow-hidden relative bg-[var(--color-surface)]">
        
        {/* Left Column: Journey Sidebar */}
        <div className="order-3 lg:order-1 w-full border-t lg:border-t-0 lg:border-r border-[var(--color-border-light)] overflow-y-auto bg-[var(--color-background)] z-10 hidden lg:block">
          <JourneySidebar roadmap={roadmap} activeTaskId={taskId} onClose={() => {}} />
        </div>

        {/* Center Column: Dominant AI Tutor */}
        <main className="order-1 lg:order-2 flex-1 w-full h-full overflow-y-auto bg-[var(--color-surface)] relative">
          <AiTutor task={task} onClose={() => {}} />
        </main>
        
        {/* Right Column: Lesson Context */}
        <div className="order-2 lg:order-3 w-full border-t lg:border-t-0 lg:border-l border-[var(--color-border-light)] overflow-y-auto bg-[var(--color-background)] z-10 hidden lg:block p-6">
          <LearningContent task={task} module={module} />
          
          {/* Action Section */}
          <div className="mt-8 pt-6 border-t border-[var(--color-border-light)]">
            {task.progressStatus === 'completed' ? (
              <div className="bg-[var(--color-background)] rounded-xl p-4 border border-[var(--color-border-light)] text-center">
                <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-2 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 mr-1.5 text-[var(--color-success)]" /> 
                  Nice work.
                </h3>
                {nextTask ? (
                  <div className="flex flex-col gap-3">
                    <p className="text-[var(--color-muted-foreground)] text-sm">
                      Next up: <strong className="text-[var(--color-foreground)]">{nextTask.title}</strong>
                    </p>
                    <Button onClick={handleNextTask} className="w-full font-semibold rounded-full shadow-sm group">
                      Next Skill <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <p className="text-[var(--color-muted-foreground)] text-sm">
                      Journey complete!
                    </p>
                    <Button onClick={handleNextTask} variant="outline" className="w-full font-semibold rounded-full">
                      Review Journey
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <Button size="lg" onClick={handleMarkComplete} className="w-full font-semibold rounded-full shadow-sm">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Mark Complete
                </Button>
                <p className="text-[var(--color-muted-foreground)] mt-3 text-xs">
                  Finished learning? Mark it complete to continue.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
