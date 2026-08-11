"use client";
import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';

export function LearningPreferencesForm({ profile, onSave }: { profile: any, onSave: (data: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    dailyAvailableTime: profile?.dailyAvailableTime || '1 hour',
    availableDays: profile?.availableDays || [],
    currentLevel: profile?.currentLevel || 'Intermediate',
    learningStyle: profile?.learningStyle || 'Mixed'
  });
  const [saving, setSaving] = useState(false);

  const dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day) 
        ? prev.availableDays.filter((d: string) => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Learning Preferences</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Daily Available Time</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={formData.dailyAvailableTime}
            onChange={e => setFormData({...formData, dailyAvailableTime: e.target.value})}
          >
            {['30 minutes', '1 hour', '2 hours', '3 hours', '4+ hours'].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">General Current Level</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={formData.currentLevel}
            onChange={e => setFormData({...formData, currentLevel: e.target.value})}
          >
            {['Beginner', 'Basic knowledge', 'Intermediate', 'Advanced'].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
        <div className="flex flex-wrap gap-2">
          {dayOptions.map(day => (
            <button
              key={day}
              type="button"
              onClick={() => handleDayToggle(day)}
              className={`px-3 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                formData.availableDays.includes(day) 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Learning Style</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['Theory', 'Practical', 'Project-based', 'Mixed'].map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => setFormData({...formData, learningStyle: opt})}
              className={`p-2 text-center border rounded-md text-sm font-medium transition-colors ${
                formData.learningStyle === opt
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={saving}
          className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-70 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Preferences
        </button>
      </div>
    </form>
  );
}

