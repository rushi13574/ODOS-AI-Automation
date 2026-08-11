'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-provider';

/**
 * Dashboard layout — authenticated shell with sidebar.
 * Redirects to login if not authenticated.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-sidebar-border bg-sidebar">
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <span className="text-xl font-bold gradient-text">ODOS</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { href: '/dashboard', label: 'Dashboard', icon: '◆' },
            { href: '/dashboard/today', label: 'Today', icon: '📅' },
            { href: '/dashboard/calendar', label: 'Calendar', icon: '🗓️' },
            { href: '/dashboard/progress', label: 'Progress', icon: '📈' },
            { href: '/dashboard/ai-tutor', label: 'AI Tutor', icon: '🤖' },
            { href: '/onboarding', label: 'New Roadmap', icon: '✨' },
            { href: '/dashboard/profile', label: 'Profile', icon: '◍' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
            >
              <span className="text-xs opacity-60">{item.icon}</span>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user.user_metadata?.display_name || user.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
