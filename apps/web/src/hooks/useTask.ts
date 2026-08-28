"use client";
import { useMemo } from 'react';
import { useSkillContext } from './useSkillContext';
import { apiClient } from '../lib/api';

export function useTask(taskId?: string) {
  const { activeGoal, roadmap, loading, error: activeGoalError } = useSkillContext();

  const { task, module } = useMemo(() => {
    if (!roadmap || !roadmap.modules || !taskId) return { task: null, module: null };

    for (const m of roadmap.modules) {
      const foundTask = (m.skills || []).find((s: any) => s.id === taskId);
      if (foundTask) {
        return { task: foundTask, module: m };
      }
    }
    return { task: null, module: null };
  }, [roadmap, taskId]);

  const updateProgress = async (status: 'in_progress' | 'completed', actualMinutes: number = 0) => {
    if (!activeGoal || !taskId) return;
    try {
      await apiClient.post(`/tasks/${taskId}/progress`, {
        learningGoalId: activeGoal.id,
        status,
        actualMinutes,
      });
    } catch (err) {
      console.error("Failed to update task progress", err);
      throw err;
    }
  };

  return {
    task,
    module,
    roadmap,
    activeGoal,
    loading,
    error: activeGoalError || (!loading && !task && taskId ? new Error("Task not found") : null),
    updateProgress,
  };
}
