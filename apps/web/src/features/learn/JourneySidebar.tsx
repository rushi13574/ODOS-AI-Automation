import React from 'react';
import Link from 'next/link';
import { X, CheckCircle2, PlayCircle, Circle } from 'lucide-react';
import { useSkillContext } from '@/hooks/useSkillContext';

interface JourneySidebarProps {
  roadmap: any;
  activeTaskId: string;
  onClose: () => void;
}

export function JourneySidebar({ roadmap, activeTaskId, onClose }: JourneySidebarProps) {
  const { activeGoal } = useSkillContext();
  if (!roadmap) return null;

  return (
    <div className="flex flex-col h-full bg-[var(--color-sidebar)] text-[var(--color-sidebar-foreground)]">
      <div className="flex items-center justify-between p-4 border-b border-[var(--color-sidebar-border)]">
        <h3 className="font-semibold truncate pr-2">Journey Outline</h3>
        <button onClick={onClose} className="lg:hidden p-1 rounded-md hover:bg-[var(--color-sidebar-accent)] text-[var(--color-sidebar-foreground)]">
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {roadmap.modules?.map((m: any, mIndex: number) => {
          const hasActiveTask = m.skills?.some((s: any) => s.id === activeTaskId);
          return (
            <div key={m.id} className="space-y-2">
              <h4 className={`text-xs font-bold uppercase tracking-wider ${hasActiveTask ? 'text-[var(--color-primary)]' : 'text-gray-500'}`}>
                Module {mIndex + 1}: {m.title}
              </h4>
              <div className="space-y-1 relative before:absolute before:inset-0 before:ml-2 before:w-px before:bg-[var(--color-sidebar-border)]">
                {m.skills?.map((s: any) => {
                  const isActive = s.id === activeTaskId;
                  const isCompleted = s.progressStatus === 'completed';
                  
                  return (
                    <Link 
                      key={s.id} 
                      href={`/skill/${activeGoal?.id}/learn/${s.id}`}
                      className={`relative flex items-start p-2 rounded-lg transition-colors group ${
                        isActive ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'hover:bg-[var(--color-sidebar-accent)]'
                      }`}
                    >
                      <div className="mt-0.5 mr-3 z-10 bg-[var(--color-sidebar)] rounded-full shrink-0">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-[var(--color-muted-foreground)] opacity-50" />
                        ) : isActive ? (
                          <Circle className="w-4 h-4 text-[var(--color-primary)] fill-[var(--color-primary)]" />
                        ) : (
                          <Circle className="w-4 h-4 text-[var(--color-border-light)] group-hover:text-[var(--color-muted-foreground)] transition-colors" />
                        )}
                      </div>
                      <span className={`text-sm font-medium leading-snug line-clamp-2 ${
                        isActive ? 'text-[var(--color-primary)] font-semibold' : 
                        isCompleted ? 'text-[var(--color-muted-foreground)] opacity-60 line-through decoration-[var(--color-border-light)]' : 
                        'text-[var(--color-muted-foreground)] group-hover:text-[var(--color-foreground)] transition-colors'
                      }`}>
                        {s.title}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
