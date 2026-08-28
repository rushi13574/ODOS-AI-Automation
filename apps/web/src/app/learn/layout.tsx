'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-provider';
import { useLearningGoals } from '@/hooks/useLearningGoals';

/**
 * Learn layout — guards learn routes.
 *
 * Uses `goals.length === 0` (not `hasActiveGoal`) to decide whether the
 * user should be redirected to onboarding. A user with completed or
 * inactive goals is still an existing user.
 */
export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { goals, loading: goalsLoading } = useLearningGoals();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user && !goalsLoading) {
      if (goals.length === 0) {
        router.push('/onboarding');
      }
    }
  }, [user, authLoading, goals, goalsLoading, router]);

  if (authLoading || goalsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mb-4"></div>
      </div>
    );
  }

  if (!user || goals.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {children}
    </div>
  );
}
