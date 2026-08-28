"use client";
import React from 'react';
import { useLearningGoals } from '@/hooks/useLearningGoals';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ActiveJourneyCard } from './ActiveJourneyCard';
import { CompletedJourneyCard } from './CompletedJourneyCard';

export function SkillsOverview() {
  const { goals, loading, error } = useLearningGoals();

  if (loading) {
    return <LoadingState message="Loading your learning journeys..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Unable to load skills"
        description="We encountered a problem loading your learning journeys."
      />
    );
  }

  if (!goals || goals.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="w-8 h-8 text-[var(--color-primary)]" />}
        title="Your journey starts here."
        description="You haven't started a learning journey yet."
      />
    );
  }

  const activeGoals = goals.filter((g: any) => g.status !== 'completed' && g.status !== 'abandoned');
  const completedGoals = goals.filter((g: any) => g.status === 'completed');

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-2">My Skills</h1>
        <p className="text-lg text-[var(--color-muted-foreground)]">
          Your learning journeys, progress, and completed skills.
        </p>
      </div>

      {activeGoals.length > 0 ? (
        <section className="mb-16">
          <h2 className="text-sm font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-6">
            Active Learning
          </h2>
          <div className="space-y-8">
            {activeGoals.map((goal: any) => (
              <ActiveJourneyCard key={goal.id} goal={goal} />
            ))}
          </div>
        </section>
      ) : (
        <section className="mb-16">
          <EmptyState
            icon={<BookOpen className="w-8 h-8 text-[var(--color-primary)]" />}
            title="You're not currently learning a new skill."
            description="Start a new learning journey to see it here."
          />
          <div className="mt-4 flex justify-center">
            <Link href="/onboarding">
              <Button>Start a New Journey</Button>
            </Link>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-sm font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-6">
          Completed Skills
        </h2>
        {completedGoals.length > 0 ? (
          <div className="flex flex-col gap-1 border border-[var(--color-border-light)] rounded-2xl bg-white/50 p-2">
            {completedGoals.map((goal: any) => (
              <CompletedJourneyCard key={goal.id} goal={goal} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Sparkles className="w-8 h-8 text-[var(--color-muted-foreground)]" />}
            title="Your completed skills will appear here as you progress."
            description="Keep up the good work on your active journeys!"
          />
        )}
      </section>
    </div>
  );
}
