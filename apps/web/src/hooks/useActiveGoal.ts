"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

/**
 * Finds the first learning goal that actually has a roadmap.
 * 
 * The user may have multiple "active" goals from repeated onboarding
 * attempts where roadmap generation failed. This hook iterates through
 * all goals (newest first) and returns the first one with a valid roadmap.
 * 
 * This replaces the naive `goals[0]` pattern that previously caused
 * every page to break when the newest goal had no roadmap.
 */
export function useActiveGoal() {
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const findActiveGoal = async () => {
      try {
        setLoading(true);

        // 1. Fetch all goals (sorted by createdAt DESC from backend)
        const goalsRes = await apiClient.get('/learning-goals');
        const goals = goalsRes.data || [];

        if (goals.length === 0) {
          if (isMounted) {
            setActiveGoal(null);
            setRoadmap(null);
            setLoading(false);
          }
          return;
        }

        // 2. Try each goal until we find one with a roadmap
        for (const goal of goals) {
          if (goal.status !== 'active') continue;

          try {
            const roadmapRes = await apiClient.get(`/roadmaps/by-goal/${goal.id}`);
            if (roadmapRes.data && roadmapRes.data.modules) {
              // Found a goal with a valid roadmap

              // 3. Also fetch progress to hydrate the roadmap
              let progressMap: Record<string, any> = {};
              try {
                const progressRes = await apiClient.get(`/learning-goals/${goal.id}/progress`);
                (progressRes.data || []).forEach((p: any) => {
                  progressMap[p.taskId] = p;
                });
              } catch {
                // Progress fetch is non-critical
              }

              // 4. Hydrate roadmap modules with progress status
              const hydratedRoadmap = { ...roadmapRes.data };
              if (hydratedRoadmap.modules) {
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

              if (isMounted) {
                setActiveGoal(goal);
                setRoadmap(hydratedRoadmap);
                setError(null);
              }
              return;
            }
          } catch (err: any) {
            // 404 means no roadmap — try next goal
            if (err?.response?.status === 404) {
              continue;
            }
            // Other errors — still try next goal but log
            console.warn(`[useActiveGoal] Error fetching roadmap for goal ${goal.id}:`, err);
            continue;
          }
        }

        // No goal with a roadmap found
        if (isMounted) {
          setActiveGoal(goals[0]); // Return first goal for context
          setRoadmap(null);
          setError(null);
          setLoading(false);
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

    findActiveGoal();
    return () => { isMounted = false; };
  }, []);

  return { activeGoal, roadmap, loading, error };
}
