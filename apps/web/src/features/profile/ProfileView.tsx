"use client";
import React from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useAIProvider } from '../../hooks/useAIProvider';
import { PersonalInfoForm } from './PersonalInfoForm';
import { LearningPreferencesForm } from './LearningPreferencesForm';
import { AIProviderForm } from './AIProviderForm';
import { Loader2 } from 'lucide-react';

export function ProfileView() {
  const { profile, loading: profileLoading, updatePersonalInfo, updateLearningPreferences } = useProfile();
  const { config, loading: aiLoading, saveConfig, testConnection, removeConfig } = useAIProvider();

  if (profileLoading || aiLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-500">Manage your personal information, learning schedule, and AI engine preferences.</p>
      </div>

      <PersonalInfoForm profile={profile} onSave={updatePersonalInfo} />
      <LearningPreferencesForm profile={profile} onSave={updateLearningPreferences} />
      <AIProviderForm 
        config={config} 
        onSave={saveConfig} 
        onTest={testConnection} 
        onRemove={removeConfig} 
      />
    </div>
  );
}

