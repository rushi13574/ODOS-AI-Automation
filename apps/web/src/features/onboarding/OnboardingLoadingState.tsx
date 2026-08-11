"use client";
import React from 'react';
import { Loader2 } from 'lucide-react';

export function OnboardingLoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
      <Loader2 className="w-16 h-16 text-blue-600 animate-spin mb-6" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your AI Learning Roadmap</h2>
      <p className="text-gray-500 max-w-md">
        Our AI is analyzing your goals, configuring a personalized curriculum, and scheduling your calendar... This may take up to 30 seconds.
      </p>
    </div>
  );
}

