import React from 'react';
import { ProgressLayout } from '@/features/progress';

export default function ProgressPage() {
  const activeRoadmapId = "current-active-roadmap-id";

  return (
    <div className="w-full">
      <ProgressLayout roadmapId={activeRoadmapId} />
    </div>
  );
}
