"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { queryCache } from '@/lib/cache';

export interface SkillContextType {
  activeGoal: any | null;
  roadmap: any | null;
  loading: boolean;
  error: Error | null;
  setActiveGoal: (goal: any) => void;
}

const SkillContext = createContext<SkillContextType | undefined>(undefined);

export function SkillProvider({ 
  children, 
  learningGoalId 
}: { 
  children: React.ReactNode; 
  learningGoalId: string;
}) {
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchSkillContext = async () => {
      try {
        setLoading(true);
        setError(null);
        // Check cache first for hydrated roadmap
        const cacheKey = `skill-context-${learningGoalId}`;
        const cachedData = queryCache.getCache<{goal: any, roadmap: any}>(cacheKey);
        
        if (cachedData && isMounted) {
          setActiveGoal(cachedData.goal);
          setRoadmap(cachedData.roadmap);
          setLoading(false);
        } else {
          setLoading(true);
        }

        const data = await queryCache.getOrFetch(cacheKey, async () => {
          // Fetch all goals to find the matching one
          const goalsRes = await apiClient.get('/learning-goals');
          const goals = goalsRes.data || [];
          const goal = goals.find((g: any) => g.id === learningGoalId);

          if (!goal) {
            throw new Error('Learning journey not found.');
          }

          // Fetch roadmap and progress in parallel
          const [roadmapRes, progressRes] = await Promise.allSettled([
            apiClient.get(`/roadmaps/by-goal/${goal.id}`),
            apiClient.get(`/learning-goals/${goal.id}/progress`)
          ]);

          let hydratedRoadmap = null;
          if (roadmapRes.status === 'fulfilled' && roadmapRes.value.data) {
            hydratedRoadmap = { ...roadmapRes.value.data };
          } else if (roadmapRes.status === 'rejected' && roadmapRes.reason?.response?.status !== 404) {
             throw roadmapRes.reason;
          }

          let progressMap: Record<string, any> = {};
          if (progressRes.status === 'fulfilled' && progressRes.value.data) {
            (progressRes.value.data || []).forEach((p: any) => {
              progressMap[p.taskId] = p;
            });
          }

        if (hydratedRoadmap && hydratedRoadmap.modules) {
          hydratedRoadmap.modules = hydratedRoadmap.modules.map((m: any) => ({
            ...m,
            skills: (m.skills || []).map((s: any) => {
              const p = progressMap[s.id];
              return {
                ...s,
                progressStatus: p?.status || 'pending',
                actualMinutes: p?.actualMinutes || 0,
              };
            }),
          }));
        }

        return { goal, roadmap: hydratedRoadmap };
      });

        if (isMounted) {
          setActiveGoal(data.goal);
          setRoadmap(data.roadmap);
          setLoading(false);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err);
          setLoading(false);
        }
      }
    };

    if (learningGoalId) {
      fetchSkillContext();
    }
    
    return () => { isMounted = false; };
  }, [learningGoalId]);

  return (
    <SkillContext.Provider value={{ activeGoal, roadmap, loading, error, setActiveGoal }}>
      {children}
    </SkillContext.Provider>
  );
}

export function useSkillContext() {
  const context = useContext(SkillContext);
  if (context === undefined) {
    throw new Error('useSkillContext must be used within a SkillProvider');
  }
  return context;
}
