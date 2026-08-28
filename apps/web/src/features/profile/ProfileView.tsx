"use client";
import React from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useAIProvider } from '../../hooks/useAIProvider';
import { useLearningGoals } from '../../hooks/useLearningGoals';
import { PersonalInfoForm } from './PersonalInfoForm';
import { AIProviderForm } from './AIProviderForm';
import { generateSvgAvatar } from './AvatarSelector';
import { Loader2, LogOut, CheckCircle2, ChevronRight, BookOpen, Clock, Target } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-provider';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function ProfileView() {
  const { profile, loading: profileLoading, updatePersonalInfo } = useProfile();
  const { config, loading: aiLoading, saveConfig, testConnection, removeConfig } = useAIProvider();
  const { goals, loading: goalsLoading } = useLearningGoals();
  const { signOut, user } = useAuth();
  
  const [loggingOut, setLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      // Hard redirect to clear all memory state (TanStack Query, React Context, etc)
      window.location.href = '/login';
    } catch (e) {
      console.error('Logout failed', e);
      setLoggingOut(false);
    }
  };

  if (profileLoading || aiLoading || goalsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin mb-4" />
        <p className="text-[var(--color-muted-foreground)] font-medium">Loading profile...</p>
      </div>
    );
  }

  // Identity logic
  const realEmail = user?.email || profile?.email || '';
  const displayName = profile?.name || realEmail.split('@')[0] || 'Learner';
  const displayAvatar = profile?.avatar || generateSvgAvatar(displayName.charAt(0) || 'U');
  
  const memberSince = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'recently';

  // Learning Overview logic
  const activeGoals = goals.filter(g => g.status === 'active');
  const totalLessonsCompleted = activeGoals.reduce((sum, g) => sum + (g.progress?.completedNodes || 0), 0);
  const totalTimeSpent = activeGoals.reduce((sum, g) => sum + ((g.progress?.completedNodes || 0) * (g.dailyMinutes || 30)), 0);
  const hoursSpent = Math.floor(totalTimeSpent / 60);
  const minsSpent = totalTimeSpent % 60;
  
  const totalProgress = activeGoals.length > 0 
    ? Math.round(activeGoals.reduce((sum, g) => {
        const total = g.progress?.totalNodes || 1;
        const comp = g.progress?.completedNodes || 0;
        return sum + (comp / total);
      }, 0) / activeGoals.length * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto pb-20 md:pb-12 px-4 sm:px-6 pt-8">
      
      {/* ═══════════════════════════════════════════════════════
          PROFILE HEADER 
          ═══════════════════════════════════════════════════════ */}
      <div className="bg-[var(--color-card)] rounded-2xl shadow-sm border border-[var(--color-border-light)] p-8 mb-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
        <div className="w-24 h-24 rounded-full border-4 border-white shadow-md ring-1 ring-[var(--color-border-light)] overflow-hidden shrink-0">
          <img src={displayAvatar} alt={displayName} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 mt-2">
          <h1 className="text-3xl font-extrabold text-[var(--color-foreground)] tracking-tight">{displayName}</h1>
          <p className="text-[var(--color-primary)] font-bold text-sm tracking-widest uppercase mt-1 mb-3">Learner</p>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-[var(--color-muted-foreground)] text-sm font-medium">
            <span>{realEmail}</span>
            <span className="hidden sm:inline text-[var(--color-border-light)]">•</span>
            <span>Member since {memberSince}</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          PERSONAL INFORMATION 
          ═══════════════════════════════════════════════════════ */}
      <PersonalInfoForm profile={profile} userEmail={realEmail} onSave={updatePersonalInfo} />

      {/* ═══════════════════════════════════════════════════════
          LEARNING OVERVIEW
          ═══════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-muted-foreground)] mb-4 ml-1">Learning Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border-light)] p-5 text-center shadow-sm">
            <Target className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold text-[var(--color-foreground)]">{activeGoals.length}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mt-1">Active Skills</p>
          </div>
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border-light)] p-5 text-center shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-[var(--color-success)] mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold text-[var(--color-foreground)]">{totalLessonsCompleted}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mt-1">Lessons Done</p>
          </div>
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border-light)] p-5 text-center shadow-sm">
            <Clock className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold text-[var(--color-foreground)]">{hoursSpent > 0 ? `${hoursSpent}h ` : ''}{minsSpent}m</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mt-1">Time Learned</p>
          </div>
          <div className="bg-[var(--color-card)] rounded-xl border border-[var(--color-border-light)] p-5 text-center shadow-sm">
            <BookOpen className="w-6 h-6 text-[var(--color-primary)] mx-auto mb-2 opacity-80" />
            <p className="text-2xl font-bold text-[var(--color-foreground)]">{totalProgress}%</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-muted-foreground)] mt-1">Avg Progress</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          YOUR LEARNING
          ═══════════════════════════════════════════════════════ */}
      {activeGoals.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-muted-foreground)] mb-4 ml-1">Your Learning</h2>
          <div className="bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border-light)] overflow-hidden">
            {activeGoals.map((goal, idx) => {
              const total = goal.progress?.totalNodes || 1;
              const comp = goal.progress?.completedNodes || 0;
              const pct = Math.round((comp / total) * 100);
              return (
                <Link key={goal.id} href={`/skill/${goal.id}/main`} className="block group">
                  <div className={`p-4 sm:p-5 flex items-center justify-between hover:bg-[var(--color-surface)] transition-colors ${idx !== activeGoals.length - 1 ? 'border-b border-[var(--color-border-light)]' : ''}`}>
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-[var(--color-foreground)] text-lg">{goal.skillName}</h3>
                        <span className="bg-[var(--color-primary-light)] text-[var(--color-primary)] text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          {goal.targetLevel}
                        </span>
                      </div>
                      <div className="w-full bg-[var(--color-border-light)] rounded-full h-1.5 overflow-hidden mt-3 max-w-xs">
                        <div className="bg-[var(--color-primary)] h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-[var(--color-muted-foreground)] text-sm">{pct}%</span>
                      <ChevronRight className="w-5 h-5 text-[var(--color-border-light)] group-hover:text-[var(--color-primary)] group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          ACCOUNT & SECURITY
          ═══════════════════════════════════════════════════════ */}
      <div className="mb-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-muted-foreground)] mb-4 ml-1">Account & Security</h2>
        <div className="bg-[var(--color-card)] rounded-xl shadow-sm border border-[var(--color-border-light)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Email</label>
              <div className="text-base font-bold text-[var(--color-foreground)] mb-1">
                {realEmail}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-success)] uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Verified
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-muted-foreground)] mb-1">Account Status</label>
              <div className="text-base font-bold text-[var(--color-foreground)]">
                Active Member
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--color-border-light)] flex justify-between items-center">
            <span className="text-sm font-medium text-[var(--color-muted-foreground)]">Log out of your account on this device.</span>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center font-bold text-[var(--color-foreground)] border-[var(--color-border-light)] hover:bg-[var(--color-border-light)]/50 rounded-full px-6"
            >
              {loggingOut ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LogOut className="w-4 h-4 mr-2" />}
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          AI & ADVANCED SETTINGS
          ═══════════════════════════════════════════════════════ */}
      <div className="opacity-80 hover:opacity-100 transition-opacity">
        <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-[var(--color-muted-foreground)] mb-4 ml-1">AI & Advanced Settings</h2>
        <AIProviderForm 
          config={config} 
          onSave={saveConfig} 
          onTest={testConnection} 
          onRemove={removeConfig} 
        />
      </div>

    </div>
  );
}
