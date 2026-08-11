"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export function useRoadmap(id?: string) {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/roadmaps/${id}`);
        setRoadmap(res.data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmap();
  }, [id]);

  const generateRoadmap = async (data: any) => {
    try {
      const res = await apiClient.post('/roadmaps/generate', data);
      return res.data;
    } catch (err: any) {
      throw err;
    }
  };

  return { roadmap, loading, error, generateRoadmap };
}

