"use client";
import React, { useState } from 'react';
import { LibrarySearch } from './LibrarySearch';
import { CurrentLearningContext } from './CurrentLearningContext';
import { DocumentCard } from './DocumentCard';
import { useDocuments } from '@/hooks/useDocuments';
import { useResourceSearch } from '@/hooks/useResources';
import { ResourceCard } from './ResourceCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { BookMarked, SearchX, FileJson } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export function LibraryOverview({ skillId }: { skillId?: string }) {
  const { documents, loading: docsLoading, error: docsError } = useDocuments(skillId);
  const { results: searchResults, loading: searchLoading, search } = useResourceSearch();
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setIsSearching(false);
      setHasSearched(false);
      return;
    }
    
    setIsSearching(true);
    setHasSearched(true);
    await search(skillId || 'global', query);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 pb-20">
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-[var(--color-foreground)] tracking-tight mb-3">Library</h1>
        <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl">
          Your learning resources, generated documents, and saved knowledge.
        </p>
      </div>

      <LibrarySearch onSearch={handleSearch} disabled={searchLoading} />

      {isSearching ? (
        <section className="mb-16">
          <h2 className="text-sm font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider mb-6 flex items-center gap-2">
            Search Results
            {searchLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          </h2>
          
          {!searchLoading && searchResults.length > 0 && (
            <div className="flex flex-col gap-0 border-t border-[var(--color-border-light)]">
              {searchResults.map((res: any) => (
                <ResourceCard key={res.id} resource={res} />
              ))}
            </div>
          )}
          
          {!searchLoading && searchResults.length === 0 && hasSearched && (
            <EmptyState
              icon={<SearchX className="w-8 h-8 text-[var(--color-muted-foreground)]" />}
              title="No resources found"
              description="Try adjusting your search terms."
            />
          )}
        </section>
      ) : (
        <>
          <CurrentLearningContext />

          <section className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-[var(--color-muted-foreground)] uppercase tracking-wider">
                My Generated Documents
              </h2>
            </div>

            {docsLoading ? (
              <div className="py-12 flex justify-center">
                <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
              </div>
            ) : docsError ? (
              <EmptyState
                title="Could not load documents"
                description="We encountered a problem loading your generated documents."
              />
            ) : documents && documents.length > 0 ? (
              <div className="flex flex-col gap-0 border-t border-[var(--color-border-light)]">
                {documents.map((doc: any) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FileJson className="w-8 h-8 text-[var(--color-primary)]" />}
                title="Your learning library will grow as you study and save resources."
                description="Use the AI Tutor while learning to generate notes, quizzes, and summaries."
              />
            )}
          </section>
        </>
      )}
    </div>
  );
}
