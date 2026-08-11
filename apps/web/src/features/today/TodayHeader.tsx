"use client";
import React from 'react';
import { TodayMetrics } from '../../hooks/useToday';
import { Target, Clock, TrendingUp, AlertTriangle, CalendarDays } from 'lucide-react';

interface TodayHeaderProps {
  metrics: TodayMetrics | null;
}

export function TodayHeader({ metrics }: TodayHeaderProps) {
  if (!metrics) {
    return <div className="h-48 bg-gray-100 animate-pulse rounded-xl mb-8"></div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b border-gray-100 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-sm font-semibold text-blue-600 mb-2">
            <span className="bg-blue-50 px-2 py-1 rounded-md">Day {metrics.dayNumber}</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{metrics.currentSkill}</h1>
          <p className="text-gray-500 text-lg mt-1">{metrics.currentModule}</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col items-end">
          <div className="flex items-center space-x-2 text-gray-600 mb-1">
            <CalendarDays className="w-4 h-4" />
            <span className="text-sm font-medium">Projected: {metrics.projectedCompletionDate}</span>
          </div>
          {metrics.delayComparedToBaseline > 0 && (
            <div className="flex items-center space-x-1 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">{metrics.delayComparedToBaseline} days behind baseline</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm font-medium mb-1 flex items-center"><Target className="w-4 h-4 mr-1"/> Today's Progress</span>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold text-gray-900">{metrics.progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
            <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${metrics.progressPercentage}%` }}></div>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-gray-500 text-sm font-medium mb-1 flex items-center"><Clock className="w-4 h-4 mr-1"/> Estimated Total</span>
          <span className="text-2xl font-bold text-gray-900">{metrics.estimatedTotalTime} <span className="text-base font-normal text-gray-500">mins</span></span>
        </div>

        <div className="flex flex-col">
          <span className="text-gray-500 text-sm font-medium mb-1 flex items-center"><TrendingUp className="w-4 h-4 mr-1"/> Completed Time</span>
          <span className="text-2xl font-bold text-emerald-600">{metrics.completedTime} <span className="text-base font-normal text-emerald-600/70">mins</span></span>
        </div>

        <div className="flex flex-col">
          <span className="text-gray-500 text-sm font-medium mb-1 flex items-center"><Clock className="w-4 h-4 mr-1"/> Remaining Time</span>
          <span className="text-2xl font-bold text-blue-600">{metrics.remainingTime} <span className="text-base font-normal text-blue-600/70">mins</span></span>
        </div>
      </div>
    </div>
  );
}

