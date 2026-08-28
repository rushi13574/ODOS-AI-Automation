"use client";
import React, { useState } from 'react';
import { AIProviderConfig } from '../../hooks/useAIProvider';
import { ShieldAlert, Key, CheckCircle, XCircle, Loader2, Save, Trash2, Webhook } from 'lucide-react';

interface Props {
  config: AIProviderConfig | null;
  onSave: (provider: string, model: string, apiKey: string) => Promise<void>;
  onTest: (provider: string, model: string, apiKey: string) => Promise<boolean>;
  onRemove: () => Promise<void>;
}

export function AIProviderForm({ config, onSave, onTest, onRemove }: Props) {
  const [provider, setProvider] = useState(config?.provider || config?.systemProvider || 'Gemini');
  const [model, setModel] = useState(config?.model || config?.systemModel || 'gemini-3.6-flash');
  const [apiKey, setApiKey] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'fail' | null>(null);

  const providerModels: Record<string, string[]> = {
    'Gemini': ['gemini-3.6-flash', 'gemini-3.7-flash'],
    'Grok': ['grok-1', 'grok-1.5'],
    'Claude': ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    'OpenAI': ['gpt-4o', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    'Ollama': ['llama3', 'mistral', 'gemma']
  };

  const handleProviderChange = (newProvider: string) => {
    setProvider(newProvider);
    setModel(providerModels[newProvider]?.[0] || '');
    setTestResult(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(provider, model, apiKey);
      setApiKey(''); // Clear memory after save
      setTestResult(null);
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey && !config?.isConfigured) return;
    setTesting(true);
    setTestResult(null);
    try {
      // In a real scenario, if they don't provide a new API key, the backend tests the existing one.
      const success = await onTest(provider, model, apiKey);
      setTestResult(success ? 'success' : 'fail');
    } catch (err) {
      setTestResult('fail');
    } finally {
      setTesting(false);
    }
  };

  const handleRemove = async () => {
    if (confirm("Are you sure you want to remove your AI configuration? AI features will be disabled.")) {
      await onRemove();
      setApiKey('');
      setTestResult(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Webhook className="w-5 h-5 mr-2 text-purple-600" />
          AI Provider Settings
        </h2>
        {config?.isConfigured ? (
          <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 uppercase tracking-wider">
            <CheckCircle className="w-3 h-3 mr-1" /> Active (Custom)
          </span>
        ) : config?.hasSystemDefault ? (
          <span className="flex items-center text-xs font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded border border-blue-200 uppercase tracking-wider">
            <CheckCircle className="w-3 h-3 mr-1" /> ODOS AI Ready
          </span>
        ) : (
          <span className="flex items-center text-xs font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200 uppercase tracking-wider">
            <XCircle className="w-3 h-3 mr-1" /> Not Configured
          </span>
        )}
      </div>

      {!config?.isConfigured && config?.hasSystemDefault && (
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start mb-6">
          <ShieldAlert className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Using ODOS System Default</p>
            <p>You do not need to configure an API key. ODOS AI is ready to use automatically.</p>
          </div>
        </div>
      )}

      {config?.isConfigured && (
        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-lg flex items-start mb-6">
          <ShieldAlert className="w-5 h-5 text-emerald-600 mr-3 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-emerald-800">
            <p className="font-semibold mb-1">Custom Provider Active</p>
            <p>Your custom API key is overriding the ODOS system default. Remove it to fallback to ODOS AI.</p>
          </div>
        </div>
      )}

      <button 
        className="text-sm font-medium text-gray-500 hover:text-gray-700 mb-6 flex items-center transition-colors"
        onClick={() => setShowAdvanced(!showAdvanced)}
      >
        {showAdvanced ? 'Hide Advanced Settings' : 'Advanced: Use Custom AI Provider'}
      </button>

      {showAdvanced && (
        <div className="border border-gray-200 rounded-lg p-5 bg-gray-50 mb-6">
          <h3 className="text-sm font-bold text-gray-800 mb-4">Custom AI Provider Override</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value)}
          >
            {Object.keys(providerModels).map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
          <select 
            className="w-full p-2 border border-gray-300 rounded-md"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {providerModels[provider]?.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="h-4 w-4 text-gray-400" />
          </div>
          <input 
            type="password"
            autoComplete="off"
            placeholder={config?.isConfigured ? "•••••••••••••••••••• (Key saved on server)" : "Enter your API key"}
            className="w-full pl-10 p-2 border border-gray-300 rounded-md font-mono"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
        {apiKey && (
          <p className="text-xs text-amber-600 mt-2 font-medium flex items-center">
            <ShieldAlert className="w-3 h-3 mr-1" /> Key is held securely in memory until you hit Save.
          </p>
        )}
      </div>

      {testResult && (
        <div className={`p-3 mb-6 rounded-md flex items-center text-sm font-medium ${testResult === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {testResult === 'success' ? <CheckCircle className="w-4 h-4 mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
          {testResult === 'success' ? 'Connection successful! Your API key is working.' : 'Connection failed. Please check your API key and provider settings.'}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-gray-100">
        <div>
          {config?.isConfigured && (
            <button 
              onClick={handleRemove}
              className="text-sm font-medium text-red-600 hover:text-red-800 flex items-center px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Remove Config
            </button>
          )}
        </div>
        
        <div className="flex space-x-3 w-full sm:w-auto mt-4 sm:mt-0">
          <button 
            type="button"
            onClick={handleTest}
            disabled={testing || (!apiKey && !config?.isConfigured)}
            className="flex-1 sm:flex-none justify-center flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            {testing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Webhook className="w-4 h-4 mr-2" />}
            Test Connection
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={saving || (!apiKey && !config?.isConfigured)}
            className="flex-1 sm:flex-none justify-center flex items-center px-6 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-70 transition-colors"
          >
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save AI Config
          </button>
        </div>
      </div>
        </div>
      )}
    </div>
  );
}

