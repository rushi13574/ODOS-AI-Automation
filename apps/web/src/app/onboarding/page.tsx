"use client";

import React from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { OnboardingForm } from '../../features/onboarding';

/**
 * Onboarding / Add Skill page.
 *
 * This page serves TWO purposes:
 *   1. First-time onboarding for new users (redirected here automatically)
 *   2. "Add Skill" flow for existing users (navigated here intentionally)
 *
 * Therefore, this page does NOT block existing users from accessing it.
 * It only requires authentication.
 */
export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <OnboardingForm />
      </div>
    </div>
  );
}
