import React from 'react';
import { AITutorLayout } from '@/features/ai-tutor';

export default function AITutorPage() {
  const activeRoadmapId = "current-active-roadmap-id";

  return (
    <div className="w-full">
      <AITutorLayout roadmapId={activeRoadmapId} />
    </div>
  );
}
