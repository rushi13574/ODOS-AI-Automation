"use client";
import { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';

export interface AIProviderConfig {
  provider: string | null;
  model: string | null;
  configurationStatus: string;
  hasSystemDefault: boolean;
  systemProvider: string;
  systemModel: string;
  isConfigured: boolean; // Indicates if the backend holds an active personal API key
}

export function useAIProvider() {
  const [config, setConfig] = useState<AIProviderConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/ai-provider');
      const data = res.data;
      setConfig({
        ...data,
        isConfigured: data.configurationStatus === 'configured' || data.configurationStatus === 'active'
      });
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const saveConfig = async (provider: string, model: string, apiKey: string) => {
    try {
      const res = await apiClient.patch('/ai-provider', { provider, model, apiKey });
      setConfig((prev) => prev ? { 
        ...prev, 
        provider, 
        model, 
        configurationStatus: res.data.configurationStatus,
        isConfigured: true 
      } : null);
    } catch (err) {
      throw err;
    }
  };

  const testConnection = async (provider: string, model: string, apiKey: string) => {
    try {
      const res = await apiClient.post('/ai-provider/test', { provider, model, apiKey });
      return res.data.success;
    } catch (err) {
      throw err;
    }
  };

  const removeConfig = async () => {
    try {
      await apiClient.delete('/ai-provider');
      if (config) {
        setConfig({ ...config, configurationStatus: 'unconfigured', isConfigured: false });
      }
    } catch (err) {
      throw err;
    }
  };

  return { config, loading, error, saveConfig, testConnection, removeConfig };
}

