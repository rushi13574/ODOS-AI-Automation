"use client";
import React from 'react';
import { CalendarLayout } from '@/features/calendar';
import { useSkillContext } from '@/hooks/useSkillContext';
import { LoadingState } from '@/components/ui/LoadingState';

export default function SkillCalendarPage() {
  const { activeGoal, loading } = useSkillContext();
  const activeRoadmapId = activeGoal?.id;

  if (loading) {
    return <LoadingState message="Loading your schedule..." />;
  }

  return (
    <div className="w-full">
      <CalendarLayout roadmapId={activeRoadmapId} />
    </div>
  );
}
