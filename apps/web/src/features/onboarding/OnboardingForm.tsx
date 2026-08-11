"use client";
import React, { useState } from 'react';
import { useRoadmap } from '../../hooks/useRoadmap';
import { OnboardingLoadingState } from './OnboardingLoadingState';
import { useRouter } from 'next/navigation';

export function OnboardingForm() {
  const router = useRouter();
  const { generateRoadmap } = useRoadmap();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    topic: '',
    currentLevel: 'Beginner',
    targetLevel: 'Basic',
    dailyTime: '30 minutes',
    days: [] as string[],
    targetDate: '',
    reason: '',
    preference: 'Mixed',
  });

  const currentLevelOptions = ['Beginner', 'Basic knowledge', 'Intermediate', 'Advanced'];
  const targetLevelOptions = ['Basic', 'Intermediate', 'Advanced', 'Job-ready', 'Expert'];
  const dailyTimeOptions = ['30 minutes', '1 hour', '2 hours', '3 hours', '4+ hours'];
  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const preferenceOptions = ['Theory', 'Practical', 'Project-based', 'Mixed'];

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic) {
      setError('Please tell us what you want to learn.');
      return;
    }
    if (formData.days.length === 0) {
      setError('Please select at least one available day.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      // Calls the API Gateway to generate roadmap & calendar
      await generateRoadmap(formData);
      // Wait a moment for UX
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to generate roadmap');
      setLoading(false);
    }
  };

  if (loading) {
    return <OnboardingLoadingState />;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Let's map out your journey</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Topic */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">What do you want to learn?</label>
          <input 
            type="text" 
            placeholder="e.g. Next.js, Python for Data Science, Spanish"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={formData.topic}
            onChange={e => setFormData({...formData, topic: e.target.value})}
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Level</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-md"
              value={formData.currentLevel}
              onChange={e => setFormData({...formData, currentLevel: e.target.value})}
            >
              {currentLevelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Target Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Level</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-md"
              value={formData.targetLevel}
              onChange={e => setFormData({...formData, targetLevel: e.target.value})}
            >
              {targetLevelOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Daily Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Daily Available Time</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-md"
              value={formData.dailyTime}
              onChange={e => setFormData({...formData, dailyTime: e.target.value})}
            >
              {dailyTimeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>

          {/* Target Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Date (Optional)</label>
            <input 
              type="date"
              className="w-full p-3 border border-gray-300 rounded-md text-gray-700"
              value={formData.targetDate}
              onChange={e => setFormData({...formData, targetDate: e.target.value})}
            />
          </div>
        </div>

        {/* Days */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
          <div className="flex flex-wrap gap-2">
            {dayOptions.map(day => (
              <button
                key={day}
                type="button"
                onClick={() => handleDayToggle(day)}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  formData.days.includes(day) 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Learning Preference</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {preferenceOptions.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => setFormData({...formData, preference: opt})}
                className={`p-3 text-center border rounded-md text-sm font-medium transition-colors ${
                  formData.preference === opt
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Learning (Optional)</label>
          <textarea 
            rows={3}
            placeholder="e.g. For a new job, personal hobby..."
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            value={formData.reason}
            onChange={e => setFormData({...formData, reason: e.target.value})}
          />
        </div>

        <div className="pt-4">
          <button 
            type="submit"
            className="w-full bg-gray-900 text-white font-bold py-4 px-8 rounded-md hover:bg-gray-800 transition-colors shadow-md text-lg"
          >
            Generate AI Roadmap
          </button>
        </div>

      </form>
    </div>
  );
}

