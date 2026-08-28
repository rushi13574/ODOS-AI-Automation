"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export interface Resource {
  id: string;
  skillId: string;
  type: 'youtube' | 'documentation' | 'article' | 'practice' | 'project';
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  metadata?: Record<string, any>;
}

export function useResources(skillId?: string) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!skillId) {
      setLoading(false);
      setResources([]);
      return;
    }

    const fetchResources = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/resources/skill/${skillId}`);
        if (isMounted) {
          setResources(res.data || []);
          setError(null);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchResources();

    return () => { isMounted = false; };
  }, [skillId]);

  return { resources, loading, error };
}

export function useResourceSearch() {
  const [results, setResults] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const search = async (skillId: string, query: string) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/resources/search`, {
        params: { skillId, q: query }
      });
      setResults(res.data || []);
      setError(null);
      return res.data;
    } catch (err: any) {
      setError(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
}
