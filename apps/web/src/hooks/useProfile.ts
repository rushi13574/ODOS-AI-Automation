"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export function useProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users/me');
      setProfile(res.data);
    } catch (err: any) {
      // Mock profile if backend is not fully ready for dev
      setProfile({
        name: 'Jane Doe',
        email: 'jane@example.com',
        bio: 'Learning new tech everyday',
        timezone: 'UTC',
        dailyAvailableTime: '2 hours',
        availableDays: ['Monday', 'Tuesday', 'Wednesday'],
        currentLevel: 'Intermediate',
        learningStyle: 'Mixed'
      });
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const updatePersonalInfo = async (data: any) => {
    try {
      const res = await apiClient.put('/users/me/personal', data);
      setProfile((prev: any) => ({ ...prev, ...data }));
      return res.data;
    } catch (err) {
      console.error(err);
      // Optimistic mock update
      setProfile((prev: any) => ({ ...prev, ...data }));
      throw err;
    }
  };

  const updateLearningPreferences = async (data: any) => {
    try {
      const res = await apiClient.put('/users/me/learning-preferences', data);
      setProfile((prev: any) => ({ ...prev, ...data }));
      return res.data;
    } catch (err) {
      console.error(err);
      // Optimistic mock update
      setProfile((prev: any) => ({ ...prev, ...data }));
      throw err;
    }
  };

  return { profile, loading, error, updatePersonalInfo, updateLearningPreferences };
}

