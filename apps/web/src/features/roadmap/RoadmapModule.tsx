import React from 'react';
import { RoadmapNode } from './RoadmapNode';

interface RoadmapModuleProps {
  module: any;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
  currentSkillId?: string;
}

export function RoadmapModule({ module, index, isActive, isCompleted, currentSkillId }: RoadmapModuleProps) {
  const formattedIndex = String(index + 1).padStart(2, '0');
  
  return (
    <div className={`transition-opacity duration-300 ${isCompleted ? 'opacity-60 hover:opacity-100' : 'opacity-100'}`}>
      <div className="mb-6">
        <h2 className="flex items-center gap-3">
          <span className={`text-lg font-bold tracking-widest ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted-foreground)]'}`}>
            {formattedIndex}
          </span>
          <span className={`text-2xl font-bold tracking-tight uppercase ${isActive ? 'text-[var(--color-foreground)]' : isCompleted ? 'text-[var(--color-muted-foreground)]' : 'text-[var(--color-foreground)]'}`}>
            {module.title}
          </span>
        </h2>
      </div>

      <div className="relative pl-8 mt-6 space-y-4">
        {/* Vertical Tree Line */}
        <div className="absolute left-[11px] top-4 bottom-8 w-px bg-[var(--color-border-light)]" />
        
        {module.skills?.map((skill: any, idx: number) => {
          const isCurrent = skill.id === currentSkillId;
          
          return (
            <div key={skill.id} className="relative">
              {/* Horizontal Branch */}
              <div className="absolute left-[-21px] top-[26px] w-5 h-px bg-[var(--color-border-light)]" />
              
              <RoadmapNode 
                skill={skill} 
                isCurrent={isCurrent}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
