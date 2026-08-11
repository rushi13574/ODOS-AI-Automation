import React from 'react';
import { TodayView } from '@/features/today';

export default function TodayPage() {
  // Hardcoded for demo/dev purposes - normally retrieved from Auth context or Profile
  const activeRoadmapId = "current-active-roadmap-id";

  return (
    <div className="w-full">
      <TodayView roadmapId={activeRoadmapId} />
    </div>
  );
}
