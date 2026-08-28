import React from 'react';
import { SkillProvider } from '@/hooks/useSkillContext';
import { SkillSidebar } from '@/features/skills/SkillSidebar';

export default async function SkillLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: any;
}) {
  const { learningGoalId } = await params;

  return (
    <SkillProvider learningGoalId={learningGoalId}>
      <div className="flex h-full w-full">
        {/* The Sidebar for the specific skill */}
        <SkillSidebar learningGoalId={learningGoalId} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </SkillProvider>
  );
}
