import React from 'react';
import { LearningWorkspace } from '@/features/learn';

export default async function SkillLearnPage({ params }: { params: any }) {
  const { taskId, learningGoalId } = await params;
  return <LearningWorkspace taskId={taskId} />;
}
