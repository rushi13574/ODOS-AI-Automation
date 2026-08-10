'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';

export default function ProfilePage() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.user_metadata?.display_name || '');
  const [selectedProvider, setSelectedProvider] = useState('gemini');

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your personal preferences and AI credentials.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Card */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">
            Personal Information
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your Name"
              />
            </div>
          </div>
        </div>

        {/* AI Provider Config Card */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground border-b border-border pb-3">
            AI Provider Credentials
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">AI Provider</label>
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="w-full rounded-xl border border-border bg-input px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI (Future)</option>
                <option value="claude">Anthropic Claude (Future)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">API Key</label>
              <input
                type="password"
                disabled
                className="w-full rounded-xl border border-border bg-secondary/50 px-4 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
                placeholder="Save API Keys in next phases"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
