"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

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
  currentModule: string;
  dayNumber: number;
  estimatedTotalTime: number;
  completedTime: number;
  remainingTime: number;
  progressPercentage: number;
  projectedCompletionDate: string;
  delayComparedToBaseline: number; // in days
}

export function useToday(roadmapId?: string) {
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);
  const [metrics, setMetrics] = useState<TodayMetrics | null>(null);
  const [objectives, setObjectives] = useState<string[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!roadmapId) return;
    const fetchToday = async () => {
      try {
        setLoading(true);
        // This hits the gateway, which routes to Scheduler Service + Learning Service
        // Mocking the structure for now since the backend endpoint might just return raw calendar
        const res = await apiClient.get(`/learning/today/${roadmapId}`);
        
        setTodayTasks(res.data?.todayTasks || []);
        setOverdueTasks(res.data?.overdueTasks || []);
        setMetrics(res.data?.metrics || null);
        setObjectives(res.data?.objectives || []);
        setResources(res.data?.resources || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchToday();
  }, [roadmapId]);

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
    loading, 
    error,
    startTask,
    pauseTask,
    completeTask,
    updatePartialProgress
  };
}

