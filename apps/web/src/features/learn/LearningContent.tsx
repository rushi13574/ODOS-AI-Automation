import React from 'react';
import { Clock, Target, BookOpen, Lightbulb, PenTool, CheckCircle2 } from 'lucide-react';

interface LearningContentProps {
  task: any;
  module: any;
}

export function LearningContent({ task, module }: LearningContentProps) {
  if (!task) return null;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      {/* Header Section */}
      <header className="border-b border-[var(--color-border-light)] pb-8">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
            {task.learningType || 'Concept'}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest bg-[var(--color-background)] text-[var(--color-muted-foreground)] border border-[var(--color-border-light)]">
            {task.difficulty}
          </span>
          <span className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-[var(--color-muted-foreground)]">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            {task.estimatedMinutes} mins
          </span>
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-foreground)] tracking-tight mb-6 leading-[1.1]">
          {task.title}
        </h1>
        
        <p className="text-xl text-[var(--color-muted-foreground)] leading-relaxed max-w-[65ch]">
          {task.description}
        </p>
      </header>

      {/* Objectives */}
      {task.objectives && task.objectives.length > 0 && (
        <section className="space-y-4 pt-2">
          <h2 className="flex items-center text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">
            <Target className="w-4 h-4 mr-2" />
            Learning Objectives
          </h2>
          <ul className="space-y-4 mt-4">
            {task.objectives.map((obj: string, i: number) => (
              <li key={i} className="flex items-start">
                <CheckCircle2 className="w-5 h-5 mr-3 text-[var(--color-primary)] shrink-0 mt-0.5 opacity-80" />
                <span className="text-[var(--color-foreground)] leading-relaxed text-lg">{obj}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Main Content Areas */}
      
      {task.practice && task.practice.length > 0 && (
        <section className="space-y-6 pt-12 mt-12 border-t border-[var(--color-border-light)]">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] tracking-tight flex items-center">
            Practice Exercises
          </h2>
          <div className="space-y-8">
            {task.practice.map((item: string, i: number) => (
              <div key={i} className="relative pl-6 border-l-2 border-[var(--color-primary)]/30">
                <p className="text-[var(--color-foreground)] leading-relaxed text-lg">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {task.assessment && task.assessment.length > 0 && (
        <section className="space-y-6 pt-12 mt-12 border-t border-[var(--color-border-light)]">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] tracking-tight">
            Check Your Understanding
          </h2>
          <div className="space-y-8">
            {task.assessment.map((item: string, i: number) => (
              <div key={i} className="flex items-start group">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-secondary)] text-[var(--color-muted-foreground)] group-hover:bg-[var(--color-primary)]/10 group-hover:text-[var(--color-primary)] font-bold text-sm mr-4 mt-0.5 transition-colors">
                  {i + 1}
                </span>
                <p className="text-[var(--color-foreground)] text-lg leading-relaxed pt-0.5">{item}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {task.projects && task.projects.length > 0 && (
        <section className="space-y-6 pt-12 mt-12 border-t border-[var(--color-border-light)]">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] tracking-tight">
            Related Projects
          </h2>
          <ul className="space-y-4">
            {task.projects.map((proj: string, i: number) => (
              <li key={i} className="flex items-start text-lg text-[var(--color-muted-foreground)]">
                <span className="mr-3 text-[var(--color-primary)] opacity-60">•</span>
                <span className="leading-relaxed">{proj}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Library Resources Connection */}
      <section className="mt-16 pt-10 border-t border-[var(--color-border-light)]">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-[var(--color-foreground)] tracking-tight">
            Learning Resources
          </h2>
          <a href="/library" className="text-sm font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 transition-colors">
            Open Library &rarr;
          </a>
        </div>
        <TaskResources skillId={task.id} />
      </section>
    </div>
  );
}

function TaskResources({ skillId }: { skillId: string }) {
  const { resources, loading } = require('@/hooks/useResources').useResources(skillId);
  const { ResourceCard } = require('@/features/library/ResourceCard');
  
  if (loading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (!resources || resources.length === 0) {
    return (
      <div className="bg-[var(--color-background)] border border-[var(--color-border-light)] rounded-xl p-8 text-center">
        <p className="text-[var(--color-foreground)] font-medium mb-2">No recommended resources found.</p>
        <p className="text-sm text-[var(--color-muted-foreground)]">Ask ODOS to generate explanations or search the library.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {resources.slice(0, 3).map((res: any) => (
        <ResourceCard key={res.id} resource={res} />
      ))}
    </div>
  );
}
