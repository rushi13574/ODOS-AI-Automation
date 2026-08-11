"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export interface CalendarTask {
  id: string;
  title: string;
  module: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
}

export interface CalendarSummaryMetrics {
  originalCompletionDate: string;
  currentProjectedDate: string;
  actualCompletionDate?: string;
  totalDelayDays: number;
}

export interface ComparisonRow {
  taskId: string;
  taskTitle: string;
  module: string;
  baselineDate: string;
  currentDate: string;
  actualCompletionDate?: string;
  differenceDays: number;
}

export interface CalendarData {
  summary: CalendarSummaryMetrics;
  baseline: CalendarTask[];
  current: CalendarTask[];
  comparison: ComparisonRow[];
}

export function useCalendar(roadmapId?: string) {
  const [data, setData] = useState<CalendarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roadmapId) return;
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        // Note: The API Gateway will hit the Scheduler Service to orchestrate this payload.
        // We mock it temporarily while the backend is pending.
        const res = await apiClient.get(`/schedule/calendar/${roadmapId}`);
        
        if (res.data && res.data.summary) {
           setData(res.data);
        } else {
           // Mock Data Generation for Frontend testing
           const today = new Date();
           const d = (days: number) => {
             const dt = new Date(today);
             dt.setDate(dt.getDate() + days);
             return dt.toISOString().split('T')[0];
           };

           const mockData: CalendarData = {
             summary: {
               originalCompletionDate: d(30),
               currentProjectedDate: d(32),
               totalDelayDays: 2
             },
             baseline: [
               { id: '1', title: 'Intro to Next.js', module: 'Fundamentals', date: d(0), status: 'pending' },
               { id: '2', title: 'Routing', module: 'Fundamentals', date: d(1), status: 'pending' },
               { id: '3', title: 'Server Components', module: 'Advanced', date: d(2), status: 'pending' },
             ],
             current: [
               { id: '1', title: 'Intro to Next.js', module: 'Fundamentals', date: d(0), status: 'completed' },
               { id: '2', title: 'Routing', module: 'Fundamentals', date: d(2), status: 'pending' }, // delayed 1 day
               { id: '3', title: 'Server Components', module: 'Advanced', date: d(4), status: 'pending' }, // delayed 2 days
             ],
             comparison: [
               { taskId: '1', taskTitle: 'Intro to Next.js', module: 'Fundamentals', baselineDate: d(0), currentDate: d(0), actualCompletionDate: d(0), differenceDays: 0 },
               { taskId: '2', taskTitle: 'Routing', module: 'Fundamentals', baselineDate: d(1), currentDate: d(2), differenceDays: 1 },
               { taskId: '3', taskTitle: 'Server Components', module: 'Advanced', baselineDate: d(2), currentDate: d(4), differenceDays: 2 },
             ]
           };
           setData(mockData);
        }
      } catch (err: any) {
        // Fallback to mock on error for UI dev
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, [roadmapId]);

  return { data, loading, error };
}

