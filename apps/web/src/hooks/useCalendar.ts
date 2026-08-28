"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { toScheduleDay, todayScheduleDay } from '@/lib/schedule-date';

export interface CalendarTask {
  id: string;
  skillNodeId: string;
  title: string;
  module: string;
  date: string;
  status: 'pending' | 'in_progress' | 'completed' | 'paused' | 'overdue';
  estimatedMinutes: number;
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
    if (!roadmapId) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        let scheduleData: any = {};
        let roadmapData: any = {};

        console.log(`[CALENDAR DEBUG] roadmapId = ${roadmapId}`);
        
        try {
          const scheduleRes = await apiClient.get(`/schedule/current?roadmapId=${roadmapId}`);
          scheduleData = scheduleRes.data;
          console.log('[CALENDAR DEBUG] schedule = SUCCESS 200');
        } catch (e: any) {
          if (e?.response?.status === 404) {
            console.log(`[CALENDAR DEBUG] schedule = 404 Not Found (empty state)`);
          } else {
            console.log(`[CALENDAR DEBUG] schedule = ERROR ${e?.response?.status} ${e?.message}`);
            throw e;
          }
        }

        try {
          // Fetch canonical roadmap to get modules and skill nodes
          const roadmapRes = await apiClient.get(`/roadmaps/by-goal/${roadmapId}`);
          roadmapData = roadmapRes.data;
          console.log('[CALENDAR DEBUG] roadmap = SUCCESS 200');
        } catch (e: any) {
          if (e?.response?.status === 404) {
            console.log(`[CALENDAR DEBUG] roadmap = 404 Not Found (empty state)`);
          } else {
            console.log(`[CALENDAR DEBUG] roadmap = ERROR ${e?.response?.status} ${e?.message}`);
            throw e;
          }
        }
        
        // Build a map for skill titles, modules, and estimated duration
        const skillMap = new Map<string, any>();
        if (roadmapData?.modules) {
          roadmapData.modules.forEach((m: any) => {
            if (m.skills) {
              m.skills.forEach((s: any) => {
                skillMap.set(s.id, {
                  title: s.title,
                  module: m.title,
                  estimatedMinutes: s.estimatedMinutes || 30
                });
              });
            }
          });
        }

        const tasks = scheduleData.tasks || [];
        
        const summary: CalendarSummaryMetrics = {
          originalCompletionDate: toScheduleDay(scheduleData.baselineCompletionDate) || todayScheduleDay(),
          currentProjectedDate: toScheduleDay(scheduleData.currentProjectedCompletionDate) || todayScheduleDay(),
          totalDelayDays: scheduleData.delayDays || 0,
        };

        const baseline: CalendarTask[] = [];
        const current: CalendarTask[] = [];
        const comparison: ComparisonRow[] = [];

        tasks.forEach((t: any) => {
          const skill = skillMap.get(t.skillNodeId);
          const title = skill?.title || 'Unknown Task';
          const module = skill?.module || 'Unknown Module';
          const estimatedMinutes = t.estimatedMinutes || skill?.estimatedMinutes || 30;
          const status = t.isCompleted ? 'completed' : t.isOverdue ? 'overdue' : 'pending';
          const bDate = toScheduleDay(t.baselineDate);
          const cDate = toScheduleDay(t.currentDate);
          const aDate = toScheduleDay(t.actualCompletionDate);

          baseline.push({ 
            id: t.id, 
            skillNodeId: t.skillNodeId,
            title, 
            module, 
            date: bDate, 
            status,
            estimatedMinutes
          });
          current.push({ 
            id: t.id, 
            skillNodeId: t.skillNodeId,
            title, 
            module, 
            date: cDate, 
            status,
            estimatedMinutes
          });
          
          const baselineDay = new Date(`${bDate}T12:00:00`);
          const currentDay = new Date(`${cDate}T12:00:00`);
          const differenceDays = Math.round((currentDay.getTime() - baselineDay.getTime()) / (1000 * 3600 * 24));

          comparison.push({
            taskId: t.id,
            taskTitle: title,
            module,
            baselineDate: bDate,
            currentDate: cDate,
            actualCompletionDate: aDate,
            differenceDays
          });
        });

        if (isMounted) {
          setData({ summary, baseline, current, comparison });
          setError(null);
        }
      } catch (err: any) {
        console.error('Failed to load calendar:', err);
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchCalendar();
    
    return () => { isMounted = false; };
  }, [roadmapId]);

  return { data, loading, error };
}

