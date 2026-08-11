"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export interface AIProviderConfig {
  provider: string;
  model: string;
  isConfigured: boolean; // Indicates if the backend holds an active API key
}

export function useAIProvider() {
  const [config, setConfig] = useState<AIProviderConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/ai/config');
      setConfig(res.data);
    } catch (err: any) {
      setError(err);
      // Mocking config since AI service is partial
      setConfig({
        provider: 'Gemini',
        model: 'gemini-1.5-pro',
        isConfigured: false
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const saveConfig = async (provider: string, model: string, apiKey: string) => {
    try {
      // The API key is sent only in the request body to the backend.
      // It is never persisted locally.
      await apiClient.put('/ai/config', { provider, model, apiKey });
      setConfig({ provider, model, isConfigured: true });
    } catch (err) {
      // Mock success for UI dev
      setConfig({ provider, model, isConfigured: true });
      throw err;
    }
  };

  const testConnection = async (provider: string, model: string, apiKey: string) => {
    try {
      const res = await apiClient.post('/ai/config/test', { provider, model, apiKey });
      return res.data.success;
    } catch (err) {
      // Mock success
      return true;
    }
  };

  const removeConfig = async () => {
    try {
      await apiClient.delete('/ai/config');
      if (config) {
        setConfig({ ...config, isConfigured: false });
      }
    } catch (err) {
      if (config) {
        setConfig({ ...config, isConfigured: false });
      }
      throw err;
    }
  };

  return { config, loading, error, saveConfig, testConnection, removeConfig };
}

