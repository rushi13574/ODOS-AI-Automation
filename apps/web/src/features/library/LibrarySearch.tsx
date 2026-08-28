"use client";
import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface LibrarySearchProps {
  onSearch: (query: string) => void;
  disabled?: boolean;
}

export function LibrarySearch({ onSearch, disabled }: LibrarySearchProps) {
  const [query, setQuery] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mb-12">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-[var(--color-muted-foreground)]" />
      </div>
      <input
        type="text"
        className="block w-full pl-11 pr-4 py-4 border border-[var(--color-border-light)] rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-base transition-all shadow-sm"
        placeholder="Search resources, documents, and topics..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
        <kbd className="hidden sm:inline-flex items-center border border-[var(--color-border-light)] rounded px-2 text-xs font-sans font-medium text-[var(--color-muted-foreground)] bg-gray-50">
          Enter
        </kbd>
      </div>
    </div>
  );
}
