import React from 'react';
import { CalendarLayout } from '@/features/calendar';

export default function CalendarPage() {
  const activeRoadmapId = "current-active-roadmap-id";

  return (
    <div className="w-full">
      <CalendarLayout roadmapId={activeRoadmapId} />
    </div>
  );
}
