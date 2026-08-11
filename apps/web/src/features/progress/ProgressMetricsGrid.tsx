"use client";
import React from 'react';
import { ProgressData } from '../../hooks/useProgress';
import { Target, CheckSquare, Clock, Activity, Flame, CalendarClock } from 'lucide-react';

export function ProgressMetricsGrid({ data }: { data: ProgressData }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center text-blue-600 mb-2">
          <Target className="w-5 h-5 mr-2" />
          <h3 className="text-sm font-medium text-gray-500">Overall</h3>
        </div>
        <div className="text-2xl font-bold text-gray-900">{data.overallCompletion}%</div>
        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${data.overallCompletion}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center text-emerald-600 mb-2">
          <CheckSquare className="w-5 h-5 mr-2" />
          <h3 className="text-sm font-medium text-gray-500">Tasks</h3>
        </div>
        <div className="flex items-end">
          <span className="text-2xl font-bold text-gray-900">{data.tasksCompleted}</span>
          <span className="text-sm font-medium text-gray-400 mb-1 ml-1">/ {data.tasksCompleted + data.tasksRemaining}</span>
        </div>
        <p className="text-xs text-gray-400 mt-2 font-medium">{data.tasksRemaining} remaining</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center text-orange-500 mb-2">
          <Flame className="w-5 h-5 mr-2" />
          <h3 className="text-sm font-medium text-gray-500">Current Streak</h3>
        </div>
        <div className="text-2xl font-bold text-gray-900">{data.currentStreak} Days</div>
        <p className="text-xs text-gray-400 mt-2 font-medium">Keep it going!</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center text-purple-600 mb-2">
          <Activity className="w-5 h-5 mr-2" />
          <h3 className="text-sm font-medium text-gray-500">Consistency</h3>
        </div>
        <div className="text-2xl font-bold text-gray-900">{data.learningConsistency}%</div>
        <p className="text-xs text-gray-400 mt-2 font-medium">Schedule adherence</p>
      </div>

    </div>
  );
}

