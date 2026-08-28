"use client";
import React from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useToday } from '@/hooks/useToday';
import { useSkillContext } from '@/hooks/useSkillContext';
import { 
  Loader2, ArrowRight, CheckCircle2, Circle, Clock, 
  Calendar as CalendarIcon, BookOpen, Target, ChevronRight,
  AlertCircle, PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

/**
 * DailyLearningHub — the Skill Main page.
 *
 * Core principle: show ONLY what the user should learn TODAY.
 * The roadmap is for exploration; this page is for action.
 *
 * Data flow:
 *   SkillContext → activeGoal, roadmap
 *   useToday(goalId) → today's scheduled tasks, metrics
 *   Derive today's session from the scheduled tasks + roadmap modules
 */
export function TodayView() {
  const { user } = useAuth();
  const { activeGoal, roadmap: contextRoadmap, loading: contextLoading } = useSkillContext();
  const { todayTasks, overdueTasks, metrics, roadmap: todayRoadmap, loading: todayLoading, error } = useToday(activeGoal?.id);
  
  const loading = contextLoading || todayLoading;
  const roadmap = contextRoadmap || todayRoadmap;

  // ── Date display ──
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dateFormatted = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mx-auto mb-4" />
          <p className="text-sm text-[var(--color-muted-foreground)]">Loading today's session…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-12 px-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
          <h2 className="text-lg font-bold mb-2">We couldn't load today's learning plan.</h2>
          <p className="text-sm">{error.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="text-center max-w-md">
          <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] tracking-tight mb-2">
            Preparing your learning journey
          </h2>
          <p className="text-sm text-[var(--color-muted-foreground)]">
            ODOS AI is analyzing your goals and generating a customized roadmap and schedule.
          </p>
        </div>
      </div>
    );
  }

  const allTasks = [...overdueTasks, ...todayTasks];
  const currentTask = allTasks.find(t => t.status !== 'completed') || allTasks[0];
  const completedTasks = allTasks.filter(t => t.status === 'completed');
  const pendingTasks = allTasks.filter(t => t.status !== 'completed');
  const isOverduePresent = overdueTasks.length > 0 && overdueTasks.some(t => t.status !== 'completed');

  const greetingName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Learner';

  // ── Compute session time ──
  const totalSessionMinutes = allTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const completedMinutes = completedTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const remainingMinutes = pendingTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
  const allComplete = pendingTasks.length === 0 && allTasks.length > 0;

  // ── Find the current module from roadmap ──
  let currentModuleTitle = metrics.currentModule || 'Learning';
  let currentModuleContext: any = null;
  if (roadmap?.modules && currentTask) {
    for (const m of roadmap.modules) {
      const found = (m.skills || []).find((s: any) => s.id === currentTask.id);
      if (found) {
        currentModuleTitle = m.title;
        currentModuleContext = m;
        break;
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 md:pb-12 px-4 sm:px-6 pt-6 sm:pt-10">
      
      {/* ═══════════════════════════════════════════════════════
          DATE HEADER — prominent temporal context
          ═══════════════════════════════════════════════════════ */}
      <header className="mb-10">
        <div className="flex items-center gap-2 text-[var(--color-muted-foreground)] text-xs font-bold uppercase tracking-[0.15em] mb-3">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{dayName}</span>
          <span className="text-[var(--color-border-light)]">·</span>
          <span>{dateFormatted}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-foreground)] tracking-tight leading-tight">
          {metrics.currentSkill}
        </h1>
        <p className="text-base text-[var(--color-primary)] font-semibold mt-1">
          {currentModuleTitle}
        </p>
      </header>

      {/* ═══════════════════════════════════════════════════════
          SESSION CARD — "What should I learn today?"
          ═══════════════════════════════════════════════════════ */}
      {!allComplete && currentTask && currentTask.status !== 'completed' ? (
        <section className="mb-10">
          {/* Overdue notice */}
          {isOverduePresent && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium mb-5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>You have unfinished learning from a previous session. It's been carried forward into today.</span>
            </div>
          )}
          
          <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-2xl overflow-hidden shadow-sm">
            {/* Session header bar */}
            <div className="px-6 py-4 border-b border-[var(--color-border-light)] bg-[var(--color-surface)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 text-[var(--color-primary)]" />
                  <span className="font-bold text-[var(--color-foreground)]">Today's Learning</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-muted-foreground)]">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{totalSessionMinutes} min</span>
                </div>
              </div>
              {/* Mini progress bar */}
              {totalSessionMinutes > 0 && (
                <div className="mt-3 w-full bg-[var(--color-border-light)] rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-[var(--color-primary)] h-1.5 rounded-full transition-all duration-700 ease-out" 
                    style={{ width: `${Math.min(100, (completedMinutes / totalSessionMinutes) * 100)}%` }}
                  />
                </div>
              )}
              {completedMinutes > 0 && (
                <p className="text-xs text-[var(--color-muted-foreground)] mt-2">
                  {completedMinutes} / {totalSessionMinutes} min completed
                </p>
              )}
            </div>

            {/* Main session content */}
            <div className="px-6 py-8 sm:px-8 sm:py-10">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-foreground)] tracking-tight leading-tight mb-3">
                {currentTask.title}
              </h2>
              
              <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--color-muted-foreground)] font-medium mb-8">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-[var(--color-primary)]/8 text-[var(--color-primary)] text-xs font-bold uppercase tracking-wider">
                  {currentTask.type || 'lesson'}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Est. {currentTask.estimatedMinutes} min
                </span>
              </div>

              {/* Primary CTA */}
              <Link href={`/skill/${activeGoal?.id}/learn/${currentTask.id}`}>
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-base font-bold px-10 py-6 rounded-2xl shadow-md shadow-[var(--color-primary)]/20 group transition-all hover:shadow-lg hover:shadow-[var(--color-primary)]/30"
                >
                  <PlayCircle className="w-5 h-5 mr-2" />
                  {currentTask.status === 'in_progress' ? 'Continue Learning' : 'Start Today\'s Lesson'}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      ) : allComplete ? (
        /* ═══════════════════════════════════════════════════════
           COMPLETED STATE
           ═══════════════════════════════════════════════════════ */
        <section className="mb-10">
          <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-2xl p-8 sm:p-10 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--color-success)]/10 mb-6">
              <CheckCircle2 className="w-8 h-8 text-[var(--color-success)]" />
            </div>
            <h2 className="text-2xl font-bold text-[var(--color-foreground)] tracking-tight mb-2">
              Today's lesson complete
            </h2>
            <p className="text-[var(--color-muted-foreground)] mb-2">
              You completed {completedMinutes} minutes of learning today. Great work, {greetingName}!
            </p>
            <p className="text-sm text-[var(--color-muted-foreground)] mb-8">
              Next session: {getNextSessionDay()}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/skill/${activeGoal?.id}/roadmap`}>
                <Button variant="outline" className="rounded-full font-semibold px-8">View Full Roadmap</Button>
              </Link>
              <Link href="/home">
                <Button variant="outline" className="rounded-full font-semibold px-8">Back to My Learning</Button>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        /* ═══════════════════════════════════════════════════════
           NO TASKS STATE
           ═══════════════════════════════════════════════════════ */
        <section className="mb-10">
          <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-2xl p-8 sm:p-10 text-center shadow-sm">
            <CalendarIcon className="w-12 h-12 text-[var(--color-muted-foreground)] mx-auto mb-4 opacity-50" />
            <h2 className="text-xl font-bold text-[var(--color-foreground)] tracking-tight mb-2">
              No session scheduled for today
            </h2>
            <p className="text-[var(--color-muted-foreground)] mb-6 max-w-sm mx-auto">
              Check your roadmap or calendar to see your upcoming learning sessions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/skill/${activeGoal?.id}/roadmap`}>
                <Button variant="outline" className="rounded-full font-semibold px-8">View Roadmap</Button>
              </Link>
              <Link href={`/skill/${activeGoal?.id}/calendar`}>
                <Button variant="outline" className="rounded-full font-semibold px-8">View Calendar</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          TODAY'S PLAN — task checklist
          ═══════════════════════════════════════════════════════ */}
      {allTasks.length > 0 && (
        <section className="mb-10">
          <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-muted-foreground)] mb-4">
            Today's Plan
          </h3>
          <div className="space-y-2">
            {allTasks.map(t => {
              const isDone = t.status === 'completed';
              const isCurrent = !isDone && t.id === currentTask?.id;
              return (
                <div 
                  key={t.id} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isCurrent 
                      ? 'bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20' 
                      : isDone 
                        ? 'opacity-60' 
                        : 'hover:bg-[var(--color-surface)]'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0" />
                  ) : isCurrent ? (
                    <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center shrink-0">
                      <ArrowRight className="w-3 h-3 text-white" />
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-[var(--color-border-light)] shrink-0" />
                  )}
                  <span className={`text-sm font-medium flex-1 ${
                    isDone 
                      ? 'line-through text-[var(--color-muted-foreground)]' 
                      : isCurrent 
                        ? 'font-bold text-[var(--color-foreground)]' 
                        : 'text-[var(--color-muted-foreground)]'
                  }`}>
                    {t.title}
                  </span>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {t.estimatedMinutes}m
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          JOURNEY CONTEXT — minimal roadmap position
          ═══════════════════════════════════════════════════════ */}
      <section>
        <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-muted-foreground)] mb-4">
          Where am I?
        </h3>
        <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-2xl p-5 sm:p-6">
          <p className="text-sm font-bold text-[var(--color-foreground)] mb-5">
            {roadmap?.targetSkill || metrics.currentSkill || 'Your Journey'}
          </p>
          <div className="flex flex-col gap-4 relative before:absolute before:inset-y-2 before:left-2 before:w-0.5 before:bg-[var(--color-border-light)] ml-1">
            {roadmap?.modules?.slice(0, 8).map((m: any, idx: number) => {
              const isActiveModule = m.title === currentModuleTitle;
              const isPastModule = m.skills?.every((s: any) => s.progressStatus === 'completed');
              
              let icon;
              if (isPastModule) {
                icon = <div className="w-4 h-4 rounded-full bg-[var(--color-success)] flex items-center justify-center z-10"><CheckCircle2 className="w-3 h-3 text-white" /></div>;
              } else if (isActiveModule) {
                icon = <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] border-[3px] border-[var(--color-background)] shadow-sm ring-1 ring-[var(--color-primary)] z-10"></div>;
              } else {
                icon = <div className="w-4 h-4 rounded-full bg-[var(--color-background)] border-2 border-[var(--color-border-light)] z-10"></div>;
              }

              return (
                <div key={m.id} className="flex items-center gap-3 relative z-10">
                  {icon}
                  <span className={`text-sm ${isActiveModule ? 'font-bold text-[var(--color-foreground)]' : 'font-medium text-[var(--color-muted-foreground)]'}`}>
                    {m.title}
                  </span>
                  {isActiveModule && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary)]/8 px-2 py-0.5 rounded-md">
                      Current
                    </span>
                  )}
                </div>
              );
            }) || (
              <div className="text-sm text-[var(--color-muted-foreground)]">Loading journey…</div>
            )}
          </div>
          <div className="mt-6 pt-4 border-t border-[var(--color-border-light)]">
            <Link 
              href={`/skill/${activeGoal?.id}/roadmap`} 
              className="text-sm font-bold text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors inline-flex items-center group"
            >
              View full roadmap
              <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          STATS ROW — quick metrics
          ═══════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-foreground)] tracking-tight">{metrics.progressPercentage}%</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mt-1">Today</p>
        </div>
        <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-foreground)] tracking-tight">Day {metrics.dayNumber || '—'}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mt-1">Journey</p>
        </div>
        <div className="bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-foreground)] tracking-tight">{metrics.remainingTime}m</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mt-1">Left</p>
        </div>
      </div>
    </div>
  );
}

/** Helper: get the next weekday name for "Next session" display */
function getNextSessionDay(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  // Skip weekends for a simple default
  while (tomorrow.getDay() === 0 || tomorrow.getDay() === 6) {
    tomorrow.setDate(tomorrow.getDate() + 1);
  }
  return tomorrow.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}
