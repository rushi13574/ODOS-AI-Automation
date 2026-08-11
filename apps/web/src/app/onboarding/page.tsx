"use client";

import React from 'react';
import { OnboardingForm } from '../../features/onboarding';

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <OnboardingForm />
      </div>
    </div>
  );
}
