"use client";
import React, { useState } from 'react';
import { Camera, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Generates a simple SVG avatar as a data URI based on a seed
export function generateSvgAvatar(seed: string): string {
  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#14b8a6', '#f43f5e', '#6366f1',
    '#84cc16', '#d946ef', '#0ea5e9', '#f97316', '#a855f7'
  ];
  
  // Simple hash for deterministic color
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const color1 = colors[Math.abs(hash) % colors.length];
  const color2 = colors[Math.abs(hash + 1) % colors.length];
  
  const initial = seed.charAt(0).toUpperCase();

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <defs>
      <linearGradient id="grad-${seed}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${color2};stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" fill="url(#grad-${seed})" />
    <text x="50" y="50" font-family="system-ui, sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initial}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Generate 8 distinct preset avatars using uploaded files
const PRESET_AVATARS = [
  '/avatars/avatar-1.webp',
  '/avatars/avatar-2.webp',
  '/avatars/avatar-3.webp',
  '/avatars/avatar-4.webp',
  '/avatars/avatar-5.webp',
  '/avatars/avatar-6.webp',
  '/avatars/avatar-7.webp',
  '/avatars/avatar-8.webp',
];

interface AvatarSelectorProps {
  currentAvatar: string;
  onSelect: (avatarUrl: string) => void;
  nameFallback?: string;
}

export function AvatarSelector({ currentAvatar, onSelect, nameFallback = 'User' }: AvatarSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  // If there's no current avatar, default to the user's initial SVG
  const displayAvatar = currentAvatar || generateSvgAvatar(nameFallback || 'U');
  
  const handleSelect = (avatarUrl: string) => {
    onSelect(avatarUrl);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="flex items-center">
        <div className="relative group cursor-pointer" onClick={() => setIsOpen(true)}>
          <div className="w-20 h-20 bg-[var(--color-surface)] rounded-full flex items-center justify-center overflow-hidden border-2 border-[var(--color-background)] shadow-sm ring-1 ring-[var(--color-border-light)] transition-transform group-hover:scale-105">
            {displayAvatar ? (
              <img src={displayAvatar} alt="Profile Avatar" className="w-full h-full object-cover" />
            ) : (
              <Camera className="text-[var(--color-muted-foreground)] w-8 h-8" />
            )}
          </div>
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="text-white w-6 h-6" />
          </div>
        </div>
        <div className="ml-4 flex flex-col items-start">
          <Button type="button" variant="outline" size="sm" onClick={() => setIsOpen(true)}>
            Choose Avatar
          </Button>
        </div>
      </div>

      {/* Popover / Modal for selection */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border-light)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-light)]">
              <h3 className="font-bold text-[var(--color-foreground)]">Choose Avatar</h3>
              <button type="button" onClick={() => setIsOpen(false)} className="p-1 rounded-md text-[var(--color-muted-foreground)] hover:bg-[var(--color-border-light)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-4 gap-4">
                {PRESET_AVATARS.map(avatarUrl => {
                  const isSelected = currentAvatar === avatarUrl;
                  
                  return (
                    <button
                      key={avatarUrl}
                      type="button"
                      onClick={() => handleSelect(avatarUrl)}
                      className={`relative w-16 h-16 mx-auto rounded-full overflow-hidden border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2 ${
                        isSelected ? 'border-[var(--color-primary)] scale-110' : 'border-transparent'
                      }`}
                    >
                      <img src={avatarUrl} alt="Preset Avatar" className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <Check className="w-6 h-6 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            <div className="p-4 bg-[var(--color-card)] border-t border-[var(--color-border-light)] flex justify-end">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
