"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export interface ProgressData {
  overallCompletion: number; // percentage 0-100
  tasksCompleted: number;
  tasksRemaining: number;
  plannedHours: number;
  actualHours: number;
  avgSessionDuration: number; // in minutes
  scheduleDelay: number; // in days
  learningConsistency: number; // percentage 0-100
  currentStreak: number;
  baselineCompletionDate: string;
  currentProjectedDate: string;
  chartData: {
    weeklyLearning: { day: string; hours: number }[];
    monthlyLearning: { week: string; hours: number }[];
    tasksCompletedOverTime: { date: string; count: number }[];
    scheduleDelayHistory: { date: string; delay: number }[];
  };
}

export function useProgress(roadmapId: string) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/learning/progress?roadmapId=${roadmapId}`);
        setProgress(res.data);
      } catch (err: any) {
        // Mock deterministic backend payload
        setProgress({
          overallCompletion: 42,
          tasksCompleted: 28,
          tasksRemaining: 39,
          plannedHours: 45,
          actualHours: 37,
          avgSessionDuration: 55,
          scheduleDelay: 4,
          learningConsistency: 82,
          currentStreak: 5,
          baselineCompletionDate: '2026-10-15',
          currentProjectedDate: '2026-10-19',
          chartData: {
            weeklyLearning: [
              { day: 'Mon', hours: 1.5 },
              { day: 'Tue', hours: 2.0 },
              { day: 'Wed', hours: 0 },
              { day: 'Thu', hours: 1.0 },
              { day: 'Fri', hours: 2.5 },
              { day: 'Sat', hours: 3.0 },
              { day: 'Sun', hours: 1.0 }
            ],
            monthlyLearning: [
              { week: 'W1', hours: 8.5 },
              { week: 'W2', hours: 12.0 },
              { week: 'W3', hours: 6.0 },
              { week: 'W4', hours: 10.5 }
            ],
            tasksCompletedOverTime: [
              { date: 'Aug 1', count: 2 },
              { date: 'Aug 2', count: 5 },
              { date: 'Aug 3', count: 12 },
              { date: 'Aug 4', count: 18 },
              { date: 'Aug 5', count: 22 },
              { date: 'Aug 6', count: 28 }
            ],
            scheduleDelayHistory: [
              { date: 'Aug 1', delay: 0 },
              { date: 'Aug 2', delay: 1 },
              { date: 'Aug 3', delay: 0 },
              { date: 'Aug 4', delay: 2 },
              { date: 'Aug 5', delay: 3 },
              { date: 'Aug 6', delay: 4 }
            ]
          }
        });
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    if (roadmapId) {
      fetchProgress();
    }
  }, [roadmapId]);

  return { progress, loading, error };
}

