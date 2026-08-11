"use client";
import React from 'react';
import { Target, Calendar, Clock, Sparkles } from 'lucide-react';

interface Props {
  context: any;
}

export function ContextSidebar({ context }: Props) {
  if (!context) return null;

  return (
    <div className="bg-blue-50/50 rounded-xl border border-blue-100 p-5 h-full overflow-y-auto">
      <div className="flex items-center text-blue-800 mb-6 border-b border-blue-200/50 pb-4">
        <Sparkles className="w-5 h-5 mr-2" />
        <h3 className="font-bold text-lg">AI Brain Context</h3>
      </div>
      
      <p className="text-sm text-blue-700 mb-6">
        The Tutor is currently aware of your exact learning state.
      </p>

      {context.profile && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Profile</h4>
          <ul className="text-sm text-blue-900 space-y-1 bg-white/50 p-3 rounded-lg border border-blue-100/50">
            <li>Level: <span className="font-semibold">{context.profile.level}</span></li>
            <li>Daily Time: <span className="font-semibold">{context.profile.time}</span></li>
            <li>Style: <span className="font-semibold">{context.profile.style}</span></li>
          </ul>
        </div>
      )}

      {context.today && (
        <div className="mb-6">
          <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center">
            <Target className="w-4 h-4 mr-1" /> Current Focus
          </h4>
          <ul className="text-sm text-blue-900 space-y-1 bg-white/50 p-3 rounded-lg border border-blue-100/50">
            <li>Skill: <span className="font-semibold">{context.today.skill}</span></li>
            <li>Module: <span className="font-semibold">{context.today.module}</span></li>
            <li>Tasks: <span className="font-semibold">{context.today.tasks?.length || 0}</span></li>
            <li>Overdue: <span className="font-semibold text-red-600">{context.today.overdue?.length || 0}</span></li>
          </ul>
        </div>
      )}

      {context.calendar && (
        <div>
          <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center">
            <Calendar className="w-4 h-4 mr-1" /> Calendar Impact
          </h4>
          <ul className="text-sm text-blue-900 space-y-1 bg-white/50 p-3 rounded-lg border border-blue-100/50">
            <li>Target Date: <span className="font-semibold">{context.calendar.currentDate}</span></li>
            <li>Baseline Delay: <span className="font-semibold">{context.calendar.delay} days</span></li>
          </ul>
        </div>
      )}
    </div>
  );
}

