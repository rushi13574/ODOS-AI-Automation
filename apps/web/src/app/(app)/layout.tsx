'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-provider';
import { useLearningGoals } from '@/hooks/useLearningGoals';
import { Home, Map, Calendar, TrendingUp, BookOpen, UserCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { generateSvgAvatar } from '@/features/profile/AvatarSelector';

function ProfileAvatar({ user }: { user: any }) {
  const { profile } = useProfile();
  const displayName = profile?.name || user?.email?.split('@')[0] || 'U';
  const displayAvatar = profile?.avatar || generateSvgAvatar(displayName.charAt(0));
  return <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />;
}

function ProfileName({ user }: { user: any }) {
  const { profile } = useProfile();
  const displayName = profile?.name || user?.user_metadata?.display_name || user?.email;
  return <p className="text-sm font-medium text-[var(--color-foreground)] truncate">{displayName}</p>;
}

/**
 * Dashboard layout — authenticated shell with sidebar.
 *
 * ROUTING LOGIC:
 *   1. Not authenticated → /login
 *   2. Authenticated + goals still loading → show spinner, do NOT redirect
 *   3. Authenticated + goals loaded + 0 goals + not on /onboarding → /onboarding
 *   4. Authenticated + goals loaded + 1+ goals → render dashboard
 *
 * IMPORTANT: The onboarding gate uses `goals.length === 0`, NOT `hasActiveGoal`.
 * A user with completed/inactive goals is still an existing user.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { goals, loading: goalsLoading } = useLearningGoals();

  // ── Auth guard: redirect to login if not authenticated ──
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // ── First-time onboarding guard ──
  // Only redirect to /onboarding when:
  //   • Auth is resolved (user exists)
  //   • Goals have finished loading (network request completed)
  //   • User has ZERO learning goals (genuinely new user)
  //   • User is not already on /onboarding or a skill route
  useEffect(() => {
    if (authLoading || !user || goalsLoading) return;

    const isFirstTimeUser = goals.length === 0;
    const alreadyOnOnboarding = pathname.startsWith('/onboarding');
    const onSkillRoute = pathname.startsWith('/skill/');

    if (process.env.NODE_ENV === 'development') {
      console.log('[AUTH ROUTER]', {
        userId: user.id,
        goalsLoading,
        goalsCount: goals.length,
        pathname,
        destination: isFirstTimeUser && !alreadyOnOnboarding && !onSkillRoute
          ? '/onboarding'
          : 'stay',
      });
    }

    if (isFirstTimeUser && !alreadyOnOnboarding && !onSkillRoute) {
      router.push('/onboarding');
    }
  }, [user, authLoading, goals, goalsLoading, router, pathname]);

  // ── Loading states ──
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mb-4"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Show spinner while goals are loading — do NOT render the dashboard
  // shell with empty content and do NOT redirect based on incomplete data.
  if (goalsLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)] mb-4"></div>
      </div>
    );
  }

  // If goals loaded and user has zero goals, render nothing while the
  // redirect to /onboarding happens (from the useEffect above).
  if (goals.length === 0) {
    return null;
  }

  const isSkillRoute = pathname.startsWith('/skill/');

  return (
    <div className="flex min-h-screen lg:h-screen lg:overflow-hidden bg-[var(--color-background)]">
      {/* Sidebar (Desktop) - Hidden on skill routes */}
      {!isSkillRoute && (
        <aside className="hidden lg:flex w-64 h-screen shrink-0 sticky top-0 overflow-y-auto flex-col border-r border-[var(--color-sidebar-border)] bg-[var(--color-sidebar)] shadow-sm z-10 relative">
        <div className="flex h-16 items-center px-6 border-b border-[var(--color-sidebar-border)]">
          <span className="text-xl font-bold text-[var(--color-primary)]">ODOS</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {[
            { href: '/home', label: 'Home', icon: Home },
            { href: '/library', label: 'Library', icon: BookOpen },
          ].map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive 
                    ? 'text-[var(--color-primary)] font-bold' 
                    : 'text-[var(--color-sidebar-foreground)] font-medium hover:bg-[var(--color-sidebar-accent)] hover:text-[var(--color-primary)]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-primary)]' : 'opacity-80'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--color-sidebar-border)] p-4 space-y-1.5">
          <Link
            href="/profile"
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
              pathname.startsWith('/profile')
                ? 'text-[var(--color-primary)] font-bold' 
                : 'text-[var(--color-sidebar-foreground)] font-medium hover:bg-[var(--color-sidebar-accent)] hover:text-[var(--color-primary)]'
            }`}
          >
            <UserCircle className={`w-5 h-5 ${pathname.startsWith('/profile') ? 'text-[var(--color-primary)]' : 'opacity-80'}`} />
            Profile
          </Link>
          <div className="flex items-center gap-3 pt-2 mt-2 border-t border-[var(--color-border-light)]/50 px-2 cursor-pointer hover:bg-[var(--color-sidebar-accent)] p-2 rounded-xl transition-colors" onClick={() => router.push('/profile')}>
            <div className="h-8 w-8 rounded-full flex items-center justify-center overflow-hidden border border-[var(--color-border-light)]">
              <ProfileAvatar user={user} />
            </div>
            <div className="flex-1 min-w-0">
              <ProfileName user={user} />
              <p className="text-xs text-[var(--color-muted-foreground)] truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pb-20 lg:h-screen lg:overflow-y-auto lg:pb-0">
        {!isSkillRoute ? <div className="p-4 sm:p-6 lg:p-8">{children}</div> : children}
      </main>

      {/* Bottom Navigation (Mobile) - Hidden on skill routes */}
      {!isSkillRoute && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[var(--color-border-light)] flex justify-around items-center p-2 pb-safe z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        {[
          { href: '/home', label: 'Home', icon: Home },
          { href: '/library', label: 'Library', icon: BookOpen },
        ].map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${
                isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)]'
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      )}
    </div>
  );
}
