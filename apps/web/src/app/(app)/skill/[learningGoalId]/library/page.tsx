"use client";
import React, { use } from 'react';
import { LibraryOverview } from '@/features/library';

export default function SkillLibraryPage({ params }: { params: Promise<{ learningGoalId: string }> }) {
  const { learningGoalId } = use(params);
  return (
    <div className="w-full min-h-screen">
      <LibraryOverview skillId={learningGoalId} />
    </div>
  );
}
