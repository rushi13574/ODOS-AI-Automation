import React from 'react';
import { ExternalLink, PlaySquare, Book, FileText, Code, CheckSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Resource } from '@/hooks/useResources';

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const getIcon = () => {
    switch (resource.type) {
      case 'youtube':
        return <PlaySquare className="w-5 h-5 text-red-500" />;
      case 'article':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'documentation':
        return <Book className="w-5 h-5 text-purple-500" />;
      case 'project':
        return <Code className="w-5 h-5 text-green-500" />;
      case 'practice':
        return <CheckSquare className="w-5 h-5 text-orange-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeLabel = () => {
    return resource.type.toUpperCase();
  };

  const getActionLabel = () => {
    switch (resource.type) {
      case 'youtube': return 'Watch';
      case 'article': return 'Read Article';
      case 'documentation': return 'Read Docs';
      case 'project': return 'View Project';
      case 'practice': return 'Start Practice';
      default: return 'Open Resource';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-full p-5 border-b border-[var(--color-border-light)] hover:bg-[var(--color-surface)] transition-colors group rounded-none">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          {getIcon()}
          <span className="text-xs font-bold tracking-wider text-[var(--color-muted-foreground)]">
            {getTypeLabel()}
          </span>
          {resource.metadata?.duration && (
            <>
              <span className="text-[var(--color-border-light)]">•</span>
              <span className="text-xs text-[var(--color-muted-foreground)] font-medium">
                {resource.metadata.duration} min
              </span>
            </>
          )}
        </div>
        
        <h4 className="text-base font-bold text-[var(--color-foreground)] mb-1.5 line-clamp-2">
          {resource.title}
        </h4>
        
        {resource.description && (
          <p className="text-sm text-[var(--color-muted-foreground)] line-clamp-2 mb-4">
            {resource.description}
          </p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-xs text-[var(--color-muted-foreground)] truncate max-w-[200px]">
            {new URL(resource.url).hostname.replace('www.', '')}
          </span>
          <a 
            href={resource.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-semibold text-[var(--color-primary)] hover:underline opacity-80 group-hover:opacity-100 transition-opacity"
          >
            {getActionLabel()} <ExternalLink className="ml-1.5 w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
