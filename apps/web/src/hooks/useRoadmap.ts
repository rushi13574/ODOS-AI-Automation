"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export function useRoadmap(learningGoalId?: string) {
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (!learningGoalId) {
      setLoading(false);
      return;
    }

    const fetchRoadmap = async () => {
      try {
        setLoading(true);
        // 1. Fetch roadmap by learningGoalId
        const res = await apiClient.get(`/roadmaps/by-goal/${learningGoalId}`);
        const roadmapData = res.data;

        // 2. Fetch progress for the learning goal
        let progressMap: Record<string, any> = {};
        try {
          const progressRes = await apiClient.get(`/learning-goals/${learningGoalId}/progress`);
          progressRes.data.forEach((p: any) => {
            progressMap[p.taskId] = p;
          });
        } catch (progressErr) {
          console.warn("Failed to fetch progress", progressErr);
        }

        // 3. Hydrate roadmap modules and skills with progress status
        if (roadmapData && roadmapData.modules) {
          roadmapData.modules = roadmapData.modules.map((m: any) => {
            return {
              ...m,
              skills: m.skills.map((s: any) => {
                const p = progressMap[s.id];
                return {
                  ...s,
                  progressStatus: p?.status || 'pending', // pending, in_progress, completed
                  actualMinutes: p?.actualMinutes || 0
                };
              })
            };
          });
        }

        if (isMounted) {
          setRoadmap(roadmapData);
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
    fetchRoadmap();

    return () => { isMounted = false; };
  }, [learningGoalId]);

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

