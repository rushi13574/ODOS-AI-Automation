"use client";
import React from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useLearningGoals } from '@/hooks/useLearningGoals';
import { 
  Loader2, Plus, ArrowRight, BookOpen, Clock, 
  Calendar as CalendarIcon, PlayCircle 
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export function GlobalHomeView() {
  const { user } = useAuth();
  const { goals, loading, error } = useLearningGoals();

  const greetingName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Learner';
  const currentHour = new Date().getHours();
  const timeGreeting = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : 'evening';

  // Date display for the home header
  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase();
  const dateFormatted = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto mt-12 px-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
          <h2 className="text-lg font-bold mb-2">We couldn't load your learning journeys.</h2>
          <p className="text-sm">{error.message}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const activeGoals = goals.filter(g => g.status === 'active');

  return (
    <div className="max-w-5xl mx-auto pb-20 md:pb-12 px-4 sm:px-6 pt-8">
      {/* Top Context */}
      <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--color-muted-foreground)] text-xs font-bold uppercase tracking-[0.15em] mb-2">
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{dayName}</span>
            <span className="text-[var(--color-border-light)]">·</span>
            <span>{dateFormatted}</span>
          </div>
          <p className="text-[var(--color-muted-foreground)] text-sm font-medium mb-1">
            Good {timeGreeting}, {greetingName}
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-foreground)] tracking-tight">
            My Learning
          </h1>
        </div>
        <Link href="/onboarding">
          <Button className="font-semibold rounded-full shadow-sm gap-2">
            <Plus className="w-4 h-4" />
            Add Skill
          </Button>
        </Link>
      </div>

      {activeGoals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center border-2 border-dashed border-[var(--color-border-light)] rounded-2xl bg-[var(--color-surface)]">
          <BookOpen className="w-12 h-12 text-[var(--color-muted-foreground)] mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-2">Start your first learning journey</h2>
          <p className="text-[var(--color-muted-foreground)] max-w-sm mb-6">
            Tell ODOS what you want to learn, and we'll generate a personalized roadmap and schedule for you.
          </p>
          <Link href="/onboarding">
            <Button size="lg" className="rounded-full font-bold px-8 shadow-sm">
              Start Learning
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeGoals.map((goal) => (
            <Link key={goal.id} href={`/skill/${goal.id}/main`} className="group">
              <div className="flex flex-col bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all duration-200">
                {/* Card header with gradient accent */}
                <div className="h-1.5 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary)]/50" />
                
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-[var(--color-foreground)] tracking-tight group-hover:text-[var(--color-primary)] transition-colors">
                      {goal.skillName}
                    </h3>
                    <div className="bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                      {goal.targetLevel}
                    </div>
                  </div>
                  
                  {/* Daily session summary */}
                  <div className="flex items-center gap-3 text-sm text-[var(--color-muted-foreground)] mb-4">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {goal.dailyMinutes || 30} min/day
                    </span>
                  </div>

                  {/* CTA area */}
                  <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-light)]">
                    <span className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)]">
                      <PlayCircle className="w-4 h-4" />
                      Today's Session
                    </span>
                    <ArrowRight className="w-4 h-4 text-[var(--color-primary)] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
