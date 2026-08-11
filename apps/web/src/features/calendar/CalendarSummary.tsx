"use client";
import React from 'react';
import { CalendarSummaryMetrics } from '../../hooks/useCalendar';
import { Calendar, Target, Clock, AlertCircle } from 'lucide-react';

interface Props {
  metrics: CalendarSummaryMetrics;
}

export function CalendarSummary({ metrics }: Props) {
  const isDelayed = metrics.totalDelayDays > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-gray-500 text-sm font-medium mb-2 flex items-center">
          <Target className="w-4 h-4 mr-2" /> Original Plan
        </div>
        <div className="text-lg font-bold text-gray-900">{metrics.originalCompletionDate}</div>
      </div>
      
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-gray-500 text-sm font-medium mb-2 flex items-center">
          <Calendar className="w-4 h-4 mr-2" /> Current Projected
        </div>
        <div className="text-lg font-bold text-blue-600">{metrics.currentProjectedDate}</div>
      </div>

      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-gray-500 text-sm font-medium mb-2 flex items-center">
          <Clock className="w-4 h-4 mr-2" /> Actual Completion
        </div>
        <div className="text-lg font-bold text-gray-900">
          {metrics.actualCompletionDate || 'In Progress'}
        </div>
      </div>

      <div className={`p-5 rounded-xl border shadow-sm ${isDelayed ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200'}`}>
        <div className={`text-sm font-medium mb-2 flex items-center ${isDelayed ? 'text-red-700' : 'text-emerald-700'}`}>
          <AlertCircle className="w-4 h-4 mr-2" /> Total Delay
        </div>
        <div className={`text-xl font-bold ${isDelayed ? 'text-red-700' : 'text-emerald-700'}`}>
          {metrics.totalDelayDays === 0 ? 'On Track' : `${metrics.totalDelayDays} days`}
        </div>
      </div>
    </div>
  );
}

