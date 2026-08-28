"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-provider';
import { useSkillContext } from '@/hooks/useSkillContext';
import { LayoutDashboard, Map, Calendar, Library, ArrowLeft, Loader2 } from 'lucide-react';

export function SkillSidebar({ learningGoalId }: { learningGoalId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { activeGoal, loading, error } = useSkillContext();

  const baseUrl = `/skill/${learningGoalId}`;
  
  const navItems = [
    { href: `${baseUrl}/main`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `${baseUrl}/roadmap`, label: 'Roadmap', icon: Map },
    { href: `${baseUrl}/calendar`, label: 'Calendar', icon: Calendar },
    { href: `${baseUrl}/library`, label: 'Library', icon: Library },
  ];

  const isTitleLoading = loading || (!activeGoal && !error);

  if (error) {
    return (
      <aside className="hidden lg:flex w-64 flex-col border-r border-[var(--color-sidebar-border)] bg-[var(--color-sidebar)] shadow-sm z-10 relative">
        <div className="p-4">Error loading skill context</div>
      </aside>
    );
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[var(--color-sidebar-border)] bg-[var(--color-sidebar)] shadow-sm z-10 relative">
        {/* Back to Home Header */}
        <div className="flex h-16 items-center px-4 border-b border-[var(--color-sidebar-border)]">
          <button 
            onClick={() => router.push('/home')}
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors px-2 py-1 rounded-md"
          >
            <ArrowLeft className="w-4 h-4" />
            All Learning
          </button>
        </div>

        {/* Skill Title Section */}
        <div className="px-6 py-5 border-b border-[var(--color-border-light)]/50 min-h-[104px]">
          <h2 className="text-sm font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-1">
            Active Journey
          </h2>
          {isTitleLoading ? (
            <div className="animate-pulse flex flex-col gap-2 mt-3">
              <div className="h-5 bg-[var(--color-border-light)] rounded w-3/4"></div>
              <div className="h-4 bg-[var(--color-border-light)] rounded w-1/3"></div>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-bold text-[var(--color-foreground)] leading-tight truncate">
                {activeGoal?.skillName}
              </h3>
              <div className="mt-2 inline-block bg-[var(--color-primary-light)] text-[var(--color-primary)] text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide">
                {activeGoal?.targetLevel}
              </div>
            </>
          )}
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  isActive 
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold' 
                    : 'text-[var(--color-sidebar-foreground)] font-medium hover:bg-[var(--color-sidebar-accent)] hover:text-[var(--color-foreground)]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[var(--color-primary)]' : 'opacity-80'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-[var(--color-border-light)] flex justify-around items-center p-2 pb-safe z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
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
    </>
  );
}
