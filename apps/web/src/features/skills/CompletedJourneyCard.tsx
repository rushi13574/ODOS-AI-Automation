import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CompletedJourneyCardProps {
  goal: any;
}

export function CompletedJourneyCard({ goal }: CompletedJourneyCardProps) {
  // If we had a specific completion date on the entity, we'd format it here.
  const completionDate = "Recently completed";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-2 hover:bg-[var(--color-surface)] rounded-xl transition-colors group">
      <div className="flex items-center gap-4 mb-4 sm:mb-0">
        <div className="w-10 h-10 rounded-full bg-[var(--color-success)]/10 flex items-center justify-center shrink-0">
          <Trophy className="w-5 h-5 text-[var(--color-success)]" />
        </div>
        <div>
          <h3 className="font-bold text-base text-[var(--color-foreground)] line-clamp-1">
            {goal.skillName}
          </h3>
          <p className="text-sm font-medium text-[var(--color-muted-foreground)]">
            {completionDate} · Target: {goal.targetLevel}
          </p>
        </div>
      </div>
      
      <Link href={`/skill/${goal.id}/roadmap`}>
        <Button variant="ghost" className="font-medium text-[var(--color-primary)] w-full sm:w-auto">
          Review Journey <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}
