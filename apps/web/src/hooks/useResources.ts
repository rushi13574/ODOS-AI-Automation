"use client";
import { useState } from 'react';
import { apiClient } from '../lib/api';

export function useResources() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const searchResources = async (query: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/resources/search?query=${encodeURIComponent(query)}`);
      setResources(res.data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const getSkillResources = async (skillId: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/resources/skill/${skillId}`);
      setResources(res.data);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { resources, loading, error, searchResources, getSkillResources };
}

