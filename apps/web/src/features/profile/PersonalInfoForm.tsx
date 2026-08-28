"use client";
import React, { useState, useEffect } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { AvatarSelector } from './AvatarSelector';
import { Button } from '@/components/ui/Button';

interface PersonalInfoFormProps {
  profile: any;
  userEmail: string; // From Supabase Auth
  onSave: (data: any) => Promise<void>;
}

export function PersonalInfoForm({ profile, userEmail, onSave }: PersonalInfoFormProps) {
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    avatar: profile?.avatar || '',
    bio: profile?.bio || '',
    timezone: profile?.timezone || 'UTC'
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-detect timezone if they are on default UTC and haven't saved before
  useEffect(() => {
    if (profile?.timezone === 'UTC' || !profile?.timezone) {
      try {
        const detectedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (detectedTz && detectedTz !== 'UTC') {
          setFormData(prev => ({ ...prev, timezone: detectedTz }));
        }
      } catch (e) {
        // ignore timezone detection failure
      }
    }
  }, [profile?.timezone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await onSave(formData);
      setMessage({ type: 'success', text: 'Personal information saved successfully.' });
    } catch {
      setMessage({ type: 'error', text: 'We could not save your personal information. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    const updatedData = { ...formData, avatar: avatarUrl };
    setFormData(updatedData);
    
    // Auto-save avatar when selected
    setSaving(true);
    setMessage(null);
    try {
      await onSave(updatedData);
      setMessage({ type: 'success', text: 'Avatar updated.' });
    } catch {
      setMessage({ type: 'error', text: 'Could not save avatar.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border-light)] p-6 mb-8">
      <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-6 border-b border-[var(--color-border-light)] pb-4">Personal Information</h2>
      
      <div className="mb-8">
        <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-3">Profile Photo</label>
        <AvatarSelector 
          currentAvatar={formData.avatar} 
          onSelect={handleAvatarSelect} 
          nameFallback={formData.name || userEmail?.split('@')[0]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Full Name</label>
          <input 
            type="text" 
            className="w-full p-2.5 border border-[var(--color-border-light)] rounded-md bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-shadow"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Jane Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Email Address</label>
          <input 
            type="email" 
            className="w-full p-2.5 border border-[var(--color-border-light)] rounded-md bg-[var(--color-border-light)]/30 text-[var(--color-muted-foreground)] cursor-not-allowed"
            value={userEmail || ''}
            disabled
          />
          <p className="text-xs text-[var(--color-muted-foreground)] mt-1.5">Your email is managed by your account provider.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5">Timezone</label>
          <select 
            className="w-full p-2.5 border border-[var(--color-border-light)] rounded-md bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-shadow"
            value={formData.timezone}
            onChange={e => setFormData({...formData, timezone: e.target.value})}
          >
            <option value="UTC">UTC (Universal Coordinated Time)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT/BST)</option>
            <option value="Asia/Kolkata">India Standard Time (IST)</option>
            {/* If auto-detected a TZ not in this short list, render it so it doesn't break */}
            {!['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Kolkata'].includes(formData.timezone) && (
              <option value={formData.timezone}>{formData.timezone} (Auto-detected)</option>
            )}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-[var(--color-foreground)] mb-1.5 flex items-center justify-between">
            <span>About me</span>
            <span className="text-xs font-normal text-[var(--color-muted-foreground)]">Optional</span>
          </label>
          <textarea 
            rows={2}
            className="w-full p-2.5 border border-[var(--color-border-light)] rounded-md bg-[var(--color-surface)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition-shadow resize-none"
            value={formData.bio}
            onChange={e => setFormData({...formData, bio: e.target.value})}
            maxLength={200}
            placeholder="A brief sentence about your learning goals."
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-light)]">
        <div>
          {message && (
            <p role="status" className={`text-sm font-medium ${message.type === 'success' ? 'text-[var(--color-success)]' : 'text-[var(--color-destructive)]'}`}>
              {message.text}
            </p>
          )}
        </div>
        <Button 
          type="submit" 
          disabled={saving}
          className="flex items-center font-semibold rounded-full px-6"
        >
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
