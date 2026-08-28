import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { useSkillContext } from '@/hooks/useSkillContext';

interface RoadmapNodeProps {
  skill: any;
  isCurrent: boolean;
}

export function RoadmapNode({ skill, isCurrent }: RoadmapNodeProps) {
  const { activeGoal } = useSkillContext();
  const isDone = skill.progressStatus === 'completed';
  const isUpcoming = !isDone && !isCurrent;
  
  // Tree node styling
  let containerStyles = "group flex flex-col sm:flex-row sm:items-center justify-between py-4 px-5 rounded-xl border transition-all ";
  
  if (isCurrent) {
    containerStyles += "border-[var(--color-primary)] bg-[var(--color-primary)]/5 shadow-sm";
  } else if (isDone) {
    containerStyles += "border-transparent bg-transparent hover:bg-[var(--color-secondary)]/30 hover:border-[var(--color-border-light)]";
  } else {
    containerStyles += "opacity-70 border-transparent bg-transparent hover:opacity-100 hover:bg-[var(--color-secondary)]/30 hover:border-[var(--color-border-light)]";
  }

  return (
    <div className={containerStyles}>
      <div className="flex items-start sm:items-center gap-4 mb-4 sm:mb-0">
        <div className="mt-0.5 sm:mt-0 shrink-0">
          {isDone ? (
            <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
          ) : isCurrent ? (
            <div className="w-5 h-5 rounded-full bg-[var(--color-primary)] border-4 border-[var(--color-surface)] shadow-sm ring-1 ring-[var(--color-primary)]"></div>
          ) : (
            <Circle className="w-5 h-5 text-[var(--color-border-light)] fill-[var(--color-surface)]" />
          )}
        </div>
        
        <div>
          <h3 className={`text-base font-semibold tracking-tight ${isDone ? 'text-[var(--color-muted-foreground)] line-through decoration-[var(--color-border-light)]' : 'text-[var(--color-foreground)]'}`}>
            {skill.title}
          </h3>
          {isCurrent && (
            <p className="text-sm text-[var(--color-muted-foreground)] mt-1 line-clamp-1 max-w-[50ch]">
              {skill.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pl-9 sm:pl-0">
        <span className="text-xs font-medium uppercase tracking-widest text-[var(--color-muted-foreground)]">
          {skill.estimatedMinutes}m
        </span>

        <Link href={`/skill/${activeGoal?.id}/learn/${skill.id}`} className="shrink-0">
          {isCurrent ? (
            <Button size="sm" className="font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 rounded-full px-6">
              Continue Learning <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          ) : isDone ? (
            <Button variant="ghost" size="sm" className="font-medium text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 rounded-full px-4 hover:bg-[var(--color-primary)]/5">
              Review
            </Button>
          ) : (
            <Button variant="ghost" size="sm" className="font-medium text-[var(--color-muted-foreground)] rounded-full px-4 hover:bg-[var(--color-surface)]">
              View
            </Button>
          )}
        </Link>
      </div>
    </div>
  );
}
