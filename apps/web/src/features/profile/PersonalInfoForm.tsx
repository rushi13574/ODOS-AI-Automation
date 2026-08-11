"use client";
import React, { useState } from 'react';
import { Camera, Save, Loader2 } from 'lucide-react';

export function PersonalInfoForm({ profile, onSave }: { profile: any, onSave: (data: any) => Promise<void> }) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    bio: profile?.bio || '',
    timezone: profile?.timezone || 'UTC'
  });
  const [saving, setSaving] = useState(false);

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
      <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Personal Information</h2>
      
      <div className="flex items-center mb-8">
        <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden mr-4 border border-gray-300">
           <Camera className="text-gray-400 w-8 h-8" />
        </div>
        <button type="button" className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
          Change Photo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input 
            type="text" 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            value={formData.email}
            disabled
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
        <textarea 
          rows={3}
          className="w-full p-2 border border-gray-300 rounded-md"
          value={formData.bio}
          onChange={e => setFormData({...formData, bio: e.target.value})}
        />
      </div>

      <div className="mb-6 md:w-1/2">
        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
        <select 
          className="w-full p-2 border border-gray-300 rounded-md"
          value={formData.timezone}
          onChange={e => setFormData({...formData, timezone: e.target.value})}
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time (ET)</option>
          <option value="America/Los_Angeles">Pacific Time (PT)</option>
          <option value="Europe/London">London (GMT/BST)</option>
          <option value="Asia/Kolkata">India Standard Time (IST)</option>
        </select>
      </div>

      <div className="flex justify-end pt-4">
        <button 
          type="submit" 
          disabled={saving}
          className="flex items-center px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-70 transition-colors"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}

