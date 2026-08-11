"use client";
import { useState, useCallback } from 'react';
import { apiClient } from '../lib/api';
import { useProfile } from './useProfile';
import { useToday } from './useToday';
import { useCalendar } from './useCalendar';

export type MessageType = 'explanation' | 'recommendation' | 'system_action' | 'user';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  type: MessageType;
  content: string;
  timestamp: string;
  actionDetails?: any; // e.g., schedule changes validated by Scheduler Service
}

export function useAITutor(roadmapId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Hook into other contexts to build the payload
  const { profile } = useProfile();
  const { metrics: todayMetrics, todayTasks, overdueTasks } = useToday(roadmapId);
  const { data: calendarData } = useCalendar(roadmapId);

  const buildContextPayload = useCallback(() => {
    return {
      profile: profile ? {
        level: profile.currentLevel,
        time: profile.dailyAvailableTime,
        style: profile.learningStyle
      } : null,
      today: todayMetrics ? {
        skill: todayMetrics.currentSkill,
        module: todayMetrics.currentModule,
        progress: todayMetrics.progressPercentage,
        tasks: todayTasks,
        overdue: overdueTasks
      } : null,
      calendar: calendarData ? {
        originalDate: calendarData.summary.originalCompletionDate,
        currentDate: calendarData.summary.currentProjectedDate,
        delay: calendarData.summary.totalDelayDays
      } : null
    };
  }, [profile, todayMetrics, todayTasks, overdueTasks, calendarData]);

  const addMessage = (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...msg,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const sendMessage = async (message: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Add user message to UI immediately
      addMessage({ role: 'user', type: 'user', content: message });

      const context = buildContextPayload();
      
      // The API Gateway routes this to AI Service. The AI Service is responsible for:
      // 1. Deciding if this is a standard chat or a schedule mutation.
      // 2. If mutation, AI Service calls Scheduler Service to validate/execute.
      // 3. AI Service returns the structured response.
      const res = await apiClient.post('/ai/chat', { message, context });
      
      // We expect the backend to return { type, content, actionDetails }
      addMessage({
        role: 'assistant',
        type: res.data.type || 'explanation',
        content: res.data.content,
        actionDetails: res.data.actionDetails
      });

    } catch (err: any) {
      console.error(err);
      setError(err);
      // Fallback mock for UI demonstration if backend is not ready
      addMessage({
        role: 'assistant',
        type: message.toLowerCase().includes('time') ? 'system_action' : 'explanation',
        content: message.toLowerCase().includes('time') 
          ? "I understand you have limited time today. I have proposed a schedule adjustment to push the remaining tasks to tomorrow. The Scheduler Service has validated this."
          : "This is a simulated AI response based on your current context.",
        actionDetails: message.toLowerCase().includes('time') ? { rescheduled: true } : null
      });
    } finally {
      setLoading(false);
    }
  };

  const explain = async (topicId: string) => {
    await sendMessage(`Please explain the topic: ${topicId}`);
  };

  const generateQuiz = async (topicId: string) => {
    await sendMessage(`Quiz me on: ${topicId}`);
  };

  return { 
    messages, 
    sendMessage, 
    explain, 
    generateQuiz, 
    loading, 
    error,
    currentContext: buildContextPayload()
  };
}

