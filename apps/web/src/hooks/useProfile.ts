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
      const res = await apiClient.get('/profile');
      setProfile(res.data);
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to fetch profile', err);
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
      const res = await apiClient.patch('/profile', data);
      setProfile((prev: any) => ({ ...prev, ...res.data }));
      return res.data;
    } catch (err) {
      if (process.env.NODE_ENV === 'development') console.error('Failed to update profile', err);
      throw err;
    }
  };

  return { profile, loading, error, updatePersonalInfo };
}

