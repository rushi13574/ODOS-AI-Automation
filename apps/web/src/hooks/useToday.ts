"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { queryCache } from '../lib/cache';

export interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'paused';
  estimatedMinutes: number;
  completedMinutes: number;
  type: 'learning' | 'practice' | 'assessment';
}

export interface TodayMetrics {
  currentSkill: string;
  currentModule: string | null;
  dayNumber: number | null;
  estimatedTotalTime: number;
  completedTime: number;
  remainingTime: number;
  progressPercentage: number;
  projectedCompletionDate: string;
  delayComparedToBaseline: number;
}

export function useToday(learningGoalId?: string) {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<TodayMetrics | null>(null);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchToday = async () => {
      try {
        const cacheKey = `today-${learningGoalId || 'default'}`;
        
        // Optimistically render from cache
        const cachedRes = queryCache.getCache<any>(cacheKey);
        if (cachedRes && isMounted) {
          setTodayTasks(cachedRes.todayTasks || []);
          setOverdueTasks(cachedRes.overdueTasks || []);
          setMetrics(cachedRes.metrics || null);
          setObjectives(cachedRes.objectives || []);
          setResources(cachedRes.resources || []);
          setActiveGoal(cachedRes.activeGoal || null);
          setRoadmap(cachedRes.roadmap || null);
          setLoading(false); // Can hide loader immediately
        } else {
          setLoading(true);
        }

        // Fetch (or deduplicate) fresh data
        const res = await queryCache.getOrFetch(cacheKey, async () => {
          const r = await apiClient.get('/today', { params: learningGoalId ? { learningGoalId } : {} });
          return r.data;
        });
        
        if (isMounted) {
          setTodayTasks(res?.todayTasks || []);
          setOverdueTasks(res?.overdueTasks || []);
          setMetrics(res?.metrics || null);
          setObjectives(res?.objectives || []);
          setResources(res?.resources || []);
          setActiveGoal(res?.activeGoal || null);
          setRoadmap(res?.roadmap || null);
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
    fetchToday();
    
    return () => { isMounted = false; };
  }, [learningGoalId]);

  const updateTaskStatus = async (taskId: string, status: Task['status'], partialMinutes?: number) => {
    try {
      // Optimistic update
      setTodayTasks(prev => prev.map(t => 
        t.id === taskId 
          ? { ...t, status, completedMinutes: partialMinutes !== undefined ? partialMinutes : t.completedMinutes } 
          : t
      ));

      await apiClient.put(`/learning/tasks/${taskId}`, { status, partialMinutes });
    } catch (err) {
      console.error("Failed to update task", err);
      // In a real app, rollback optimistic update here
    }
  };

  const startTask = (taskId: string) => updateTaskStatus(taskId, 'in_progress');
  const pauseTask = (taskId: string) => updateTaskStatus(taskId, 'paused');
  const completeTask = (taskId: string) => updateTaskStatus(taskId, 'completed');
  
  const updatePartialProgress = (taskId: string, minutesCompleted: number) => {
    // We do NOT determine carry-forward here. We strictly pass progress to backend.
    updateTaskStatus(taskId, 'in_progress', minutesCompleted);
  };

  return { 
    todayTasks, 
    overdueTasks, 
    metrics, 
    objectives, 
    resources,
    activeGoal,
    roadmap,
    loading, 
    error,
    startTask,
    pauseTask,
    completeTask,
    updatePartialProgress
  };
}

