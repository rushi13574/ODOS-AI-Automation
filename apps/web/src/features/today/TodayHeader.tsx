"use client";
import React from 'react';
import { TodayMetrics } from '../../hooks/useToday';
import { Target, Clock, TrendingUp, AlertTriangle, CalendarDays } from 'lucide-react';

interface TodayHeaderProps {
  metrics: TodayMetrics | null;
}

import { Card, CardContent } from '@/components/ui/Card';

export function TodayHeader({ metrics }: TodayHeaderProps) {
  if (!metrics) {
    return <div className="h-48 bg-[var(--color-secondary)] animate-pulse rounded-xl mb-8"></div>;
  }

  return (
    <Card className="mb-8 border-none shadow-sm overflow-hidden bg-gradient-to-br from-[var(--color-card)] to-[var(--color-secondary)]">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-[var(--color-border-light)] pb-6">
          <div>
            <div className="flex items-center space-x-2 text-sm font-semibold text-[var(--color-primary)] mb-2">
              <span className="bg-[var(--color-primary-light)] px-3 py-1 rounded-full">Day {metrics.dayNumber}</span>
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-foreground)] tracking-tight">{metrics.currentSkill}</h1>
            <p className="text-[var(--color-muted-foreground)] text-lg mt-1 font-medium">{metrics.currentModule}</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col items-end">
            <div className="flex items-center space-x-2 text-[var(--color-muted-foreground)] mb-1 bg-white/50 px-3 py-1.5 rounded-lg border border-[var(--color-border-light)]">
              <CalendarDays className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm font-medium">Projected: {metrics.projectedCompletionDate}</span>
            </div>
            {metrics.delayComparedToBaseline > 0 && (
              <div className="flex items-center space-x-1 text-[var(--color-warning)] mt-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">{metrics.delayComparedToBaseline} days behind baseline</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col relative">
            <span className="text-[var(--color-muted-foreground)] text-sm font-medium mb-2 flex items-center"><Target className="w-4 h-4 mr-1.5"/> Today's Progress</span>
            <div className="flex items-end space-x-2">
              <span className="text-3xl font-bold text-[var(--color-foreground)] tracking-tight">{metrics.progressPercentage}%</span>
            </div>
            <div className="w-full bg-[var(--color-border-light)] rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-[var(--color-primary)] h-1.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${metrics.progressPercentage}%` }}></div>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[var(--color-muted-foreground)] text-sm font-medium mb-2 flex items-center"><Clock className="w-4 h-4 mr-1.5"/> Estimated Total</span>
            <span className="text-3xl font-bold text-[var(--color-foreground)] tracking-tight">{metrics.estimatedTotalTime} <span className="text-sm font-semibold text-[var(--color-muted-foreground)] uppercase tracking-wider">mins</span></span>
          </div>

          <div className="flex flex-col">
            <span className="text-[var(--color-muted-foreground)] text-sm font-medium mb-2 flex items-center"><TrendingUp className="w-4 h-4 mr-1.5"/> Completed Time</span>
            <span className="text-3xl font-bold text-[var(--color-success)] tracking-tight">{metrics.completedTime} <span className="text-sm font-semibold text-[var(--color-success)]/70 uppercase tracking-wider">mins</span></span>
          </div>

          <div className="flex flex-col">
            <span className="text-[var(--color-muted-foreground)] text-sm font-medium mb-2 flex items-center"><Clock className="w-4 h-4 mr-1.5"/> Remaining Time</span>
            <span className="text-3xl font-bold text-[var(--color-primary)] tracking-tight">{metrics.remainingTime} <span className="text-sm font-semibold text-[var(--color-primary)]/70 uppercase tracking-wider">mins</span></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

