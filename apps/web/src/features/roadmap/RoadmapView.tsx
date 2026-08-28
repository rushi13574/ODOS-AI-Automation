"use client";
import React from 'react';
import { useSkillContext } from '@/hooks/useSkillContext';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Map, AlertCircle, ArrowRight } from 'lucide-react';
import { RoadmapModule } from './RoadmapModule';

export function RoadmapView() {
  const { activeGoal, roadmap, loading, error } = useSkillContext();

  if (loading) {
    return <LoadingState message="Loading your learning journey..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-8 h-8 text-[var(--color-destructive)]" />}
        title="We couldn't load this learning journey."
        description="Please try refreshing the page."
      />
    );
  }

  if (!roadmap) {
    return (
      <EmptyState
        icon={<Map className="w-8 h-8 text-[var(--color-muted-foreground)]" />}
        title="Your learning journey is being prepared."
        description="ODOS AI is finalizing your modules and skills."
      />
    );
  }

  const totalModules = roadmap.modules?.length || 0;
  const totalSkills = roadmap.modules?.reduce((acc: number, m: any) => acc + (m.skills?.length || 0), 0) || 0;
  
  let completedSkills = 0;
  let currentSkillNode: any = null;
  roadmap.modules?.forEach((m: any) => {
    m.skills?.forEach((s: any) => {
      if (s.progressStatus === 'completed') completedSkills++;
      if (s.progressStatus === 'in_progress' && !currentSkillNode) currentSkillNode = s;
    });
  });

  // If no skill is in progress, find the first pending skill
  if (!currentSkillNode) {
    for (const m of roadmap.modules || []) {
      const pending = m.skills?.find((s: any) => s.progressStatus !== 'completed');
      if (pending) {
        currentSkillNode = pending;
        break;
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      {/* Header Section */}
      <div className="mb-16">
        <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-muted-foreground)] mb-3">
          Your learning journey
        </p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-4 leading-tight">
          {roadmap.targetSkill}
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-sm text-[var(--color-muted-foreground)] mb-6">
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--color-foreground)]">Basic knowledge</span>
            <ArrowRight className="w-3.5 h-3.5" />
            <span className="font-medium text-[var(--color-foreground)]">Build projects</span>
          </div>
          <span className="hidden sm:inline text-[var(--color-border-light)]">•</span>
          <div>
            <span className="font-bold text-[var(--color-foreground)]">{totalModules}</span> modules
          </div>
          <span className="hidden sm:inline text-[var(--color-border-light)]">•</span>
          <div>
            <span className="font-bold text-[var(--color-foreground)]">{completedSkills}/{totalSkills}</span> skills completed
          </div>
        </div>
        
        {/* Subtle Progress Bar */}
        <div className="w-full h-1.5 bg-[var(--color-secondary)] rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-[var(--color-primary)] transition-all duration-500"
            style={{ width: `${totalSkills > 0 ? (completedSkills / totalSkills) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-16">
        {roadmap.modules?.map((module: any, index: number) => {
          const isModuleActive = module.skills?.some((s: any) => s.id === currentSkillNode?.id);
          const isModuleCompleted = module.skills?.every((s: any) => s.progressStatus === 'completed');
          
          return (
            <RoadmapModule 
              key={module.id} 
              module={module} 
              index={index} 
              isActive={isModuleActive}
              isCompleted={isModuleCompleted}
              currentSkillId={currentSkillNode?.id}
            />
          );
        })}
      </div>
    </div>
  );
}
